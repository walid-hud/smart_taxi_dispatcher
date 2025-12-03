import { number, select } from "@inquirer/prompts";
import { log, table } from "console";
import EventEmitter from "events";
import { Colors, banner } from "./utils.ts";
import {
	type IRequestsQueue,
	type Request,
	type Taxi,
} from "./utils.ts";
let request_counter = 1;
const positions_range = 60;
function get_random() {
	return Math.ceil(Math.random() * positions_range);
}
const taxis: Taxi[] = [
	{
		id: 1,
		position: get_random(),
		available: true,
		timeRemaining: 0,
		totalRides: 0,
	},
	{
		id: 2,
		position: get_random(),
		available: false,
		timeRemaining: 0,
		totalRides: 0,
	},
	{
		id: 4,
		position: get_random(),
		available: false,
		timeRemaining: 0,
		totalRides: 0,
	},
	{
		id: 3,
		position: get_random(),
		available: false,
		timeRemaining: 0,
		totalRides: 0,
	},
];
const requests : Request[] = []
let debug = log;
// this is a trick to enable more verbose debugging or disable it when needed
// debug = ()=>{} // uncomment to disable debugging

// colored loggers because the console ones (warn,error..) don't work for some reason
function log_info(i: any) {
	debug(`${Colors.fgBlue}${i}${Colors.reset}`);
}
function log_warn(i: any) {
	debug(`${Colors.fgYellow}${i}${Colors.reset}`);
}
function log_error(i: any) {
	debug(`${Colors.fgRed}${i}${Colors.reset}`);
}
const emitter = new EventEmitter();

//queues
class Requests_Queue implements IRequestsQueue {
	constructor() {}
	queue: Request[] = [];

	enqueue(request: Request) {
		this.queue.push(request);
	}

	dequeue(): Request | undefined {
		return this.queue.shift();
	}

	peek(): Request | undefined {
		return this.queue[0];
	}

	isEmpty(): boolean {
		return this.queue.length === 0;
	}

	size(): number {
		return this.queue.length;
	}

	clear() {
		this.queue = [];
	}
}

const requests_queue = new Requests_Queue()
// events

async function on_taxi_available(taxi: Taxi) {
	if(requests_queue.isEmpty()){
		log_error("no requests pending")
		
		return		
	}
	const pending_request = requests_queue.peek()
	if(pending_request){
	emitter.emit("request_dispatch", pending_request);
	}
}
async function on_request_dispatch(request: Request) {
	log_warn("request event captured : id = " + request.reqId);
	find_available_taxi(request);
}
async function on_request_rejected(request: Request) {
	log_error("request reject id : "+request.reqId )
	requests_queue.enqueue(request)
}
async function on_request_accepted(data: { taxi: Taxi; request: Request }) {
	log_warn("request_accepted : id = " + data.request.reqId);
	requests.push(data.request)
	data.taxi.timeRemaining = data.request.duration
	await initiate_taxi_start(data.taxi, (taxi)=>{
		taxi.available = true;
		taxi.totalRides+=1
		log_info("\ntaxi "+taxi.id + " is available  ")
		log_info("request "+ data.request.reqId + " resolved")
		emitter.emit("taxi_available", taxi );
	})
	
}

emitter.on("request_accepted", on_request_accepted);
emitter.on("request_rejected" , on_request_rejected)
emitter.on("request_dispatch", on_request_dispatch);
emitter.on("taxi_available" , on_taxi_available)

async function dispatch_request() {
	log_warn("start request dispatch");
	const request: Request = {
		position: await number({
			message: "enter request position :",
			min: 1,
			max: positions_range,
			required: true,
		}),
		duration: await number({
			message: "enter estimated duration :",
			min: 1,
			max: positions_range,
			required: true,
		}),
		reqId: request_counter++,
	};
	emitter.emit("request_dispatch", request);
}
function find_available_taxi(request: Request) {
	const availableTaxis = taxis.filter((taxi) => taxi.available);
	if (availableTaxis.length === 0) {
		log_error("request rejected : id " + request.reqId);
		emitter.emit("request_rejected", request);
		return undefined;
	}
	let closest_taxi = availableTaxis[0];
	let min_distance = Math.abs(closest_taxi.position - request.position);
	for (let i = 1; i < availableTaxis.length; i++) {
		const taxi = availableTaxis[i];
		const distance = Math.abs(taxi.position - request.position);
		if (distance < min_distance) {
			min_distance = distance;
			closest_taxi = taxi;
		}
	}
	log_error("request accept check")
 	table({ request, closest_taxi })
	emitter.emit("request_accepted", {taxi:closest_taxi , request});
}

async function initiate_taxi_start(taxi: Taxi , onFinish?: (taxi: Taxi) => void) {
	if (taxi.timeRemaining <= 0) return;
	taxi.available = false;
	const interval = setInterval(() => {
		taxi.timeRemaining -= 1;
		if (taxi.timeRemaining <= 0) {
			clearInterval(interval);
			if(onFinish) onFinish(taxi)
				return;
		}
	}, 1000);
	return
}
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
				await dispatch_request();
				break;
			default :
			exit=true
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
