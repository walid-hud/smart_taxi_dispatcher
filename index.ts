import {number, select } from "@inquirer/prompts";
import { assert, log, table } from "console";
import EventEmitter from "events";
import {Colors,banner , taxis} from "./utils"
import {IRequestsQueue,IWaitingQueue, Request,Taxi  } from './utils'


class Waiting_Queue implements IWaitingQueue{
    constructor(){
    }
    queue: Request[] = [];

    enqueue(element: Request): void {
        this.queue.push(element);
    }

    dequeue(): Request|undefined {
        return this.queue.shift();
    }

    peek(): Request {
        return this.queue[0];
    }

    is_empty(): boolean {
        return this.queue.length === 0;
    }

    size(): number {
        return this.queue.length;
    }

    print(): void {
        console.log(this.queue.toString());
    }

}
class Requests_Queue implements IRequestsQueue {
	constructor(queue_size: number) {
		this.queue_size = queue_size;
	}
	queue_size: number;
	queue: Request[] = [];

	enqueue(request: Request): void {
        if(this.is_full()) {
            log(`${Colors.fgYellow} all taxi are busy, request is waiting ${Colors.reset}`)
            wait_queue.enqueue(request) 
            return  
        }else{
            this.queue.push(request);
            log(`\n ${Colors.fgBlue}request dispatched${Colors.reset}\n`)
            event_emitter.emit("new_request" , request)
        }
	}

	dequeue(request: Request): void{
		this.queue.splice(this.queue.indexOf(request) , 1);
        return
	}

	peek(): Request | undefined {
		return this.queue[0];
	}

	is_empty(): boolean {
		return this.queue.length === 0;
	}

	size(): number {
		return this.queue.length;
	}

	print(): void {
		console.log(this.queue.toString());
	}
    is_full(){
        return this.queue.length === this.queue_size
    }
}

log(banner);
let positions_range = 50;
let request_counter = 1;

const wait_queue = new Waiting_Queue()
const requests_queue = new Requests_Queue(4);
const event_emitter = new EventEmitter();
// examples

async function dispatch_request() {
	const request: Request = {
		position: await number({
			message: "enter request position :",
			min: 0,
			max: positions_range,
            required:true,
        })
        ,
        duration: await number({
			message: "enter estimated duration :",
			min: 0,
            max: positions_range,
            required:true,
        })
        ,reqId: request_counter++
	};
    requests_queue.enqueue(request)
    return

}

function dispatch_taxi(request : Request){
    

}


async function dispatch_multiple_request() {}
function print_stats() {}

async function startCountdown(taxi: Taxi, onFinish?: (taxi: Taxi) => void) {
  if (taxi.timeRemaining <= 0) return;

  const interval = setInterval(() => {
    taxi.timeRemaining -= 1;
    if (taxi.timeRemaining <= 0) {
      clearInterval(interval);
      taxi.available = true; 
      if (onFinish) onFinish(taxi);
    }
  }, 1000);
}

// function taxi_cleared(taxi : Taxi , request:Request){
//     event_emitter.emit("taxi_cleared"  , {taxi , request})
//     return
// }

event_emitter.on("taxi_cleared" , ( data :{taxi :Taxi,request:Request})=>{
    requests_queue.dequeue(data.request)
    data.taxi.available = true
    requests_queue.dequeue(data.request)
    if(!wait_queue.is_empty()){
        requests_queue.enqueue(wait_queue.dequeue()!)

    }

})
event_emitter.on("new_request" ,  (request:Request)=>{
    const closest_taxi = find_closest_taxi(request)
    if(closest_taxi){
        log(`taxi with id ${closest_taxi.id} assigned to request with id ${request.reqId}`)
        closest_taxi.timeRemaining = request.duration
        startCountdown(closest_taxi , (closest_taxi)=>{taxi_cleared(closest_taxi , request)})
    }
})

async function start_simulation() {
	let exit = false;
	while (!exit) {
		const choices = [
			"dispatch a request",
			"dispatch multiple requests",
			"print statistics",
			"exit",
		];
		const answer = await select({ message: "choose an option ", choices });
		switch (answer) {
			case choices[0]:
                await dispatch_request()
                break
		}
	}
}

let exit = false;
while (!exit) {
	let answer = await select({
		message: "start simulation ?",
		choices: ["yes", "exit"],
	});
	if (answer === "yes") {
		await start_simulation();
	} else {
		exit = true;
	}
}
