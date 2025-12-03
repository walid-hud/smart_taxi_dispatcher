import {number, select } from "@inquirer/prompts";
import { assert, log , table } from "console";
import EventEmitter from "events";
import {Colors,banner , taxis} from "./utils"
import {IRequestsQueue,IWaitingQueue, Request,Taxi  } from './utils'
let debug = log
// this is a trick to enable more verbose debugging or disable it when needed 
// debug = ()=>{}

const emitter = new EventEmitter() 
// events
function on_taxi_cleared(taxi:Taxi , request:Request){}
function on_request_dispatched(request:Request){}
function on_request_accepted(request:Request){}
function on_request_pending(request:Request){}



async function dispatch_request(){
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
