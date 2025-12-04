/*
This project could be solved in many ways (and I choose the most complex and inefficient one 💀).
The concepts I learned/used here are :
- asynchronous programming : all taxi rides simulations are async so that none is
dependant on the other

- a basic implementation of a queue data structure : the queue enqueues a request when no taxi
is available and when a taxi becomes available it checks the queue to pick up any pending requests

- node js event emitters : I divided the program into separate events using the eventemitter class

- typescript : I learned how to make a class that implements an interface

*/
import { number, select } from "@inquirer/prompts";
import { log } from "console";
import EventEmitter from "events";
import { Colors, banner } from "./utils.js";
let request_counter = 1;
const positions_range = 60;
function get_random() {
    return Math.ceil(Math.random() * positions_range);
}
// the program starts with 4 taxis at random positions
const taxis = [
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
        available: true,
        timeRemaining: 0,
        totalRides: 0,
    },
    {
        id: 4,
        position: get_random(),
        available: true,
        timeRemaining: 0,
        totalRides: 0,
    },
    {
        id: 3,
        position: get_random(),
        available: true,
        timeRemaining: 0,
        totalRides: 0,
    },
];
const requests = [];
let debug = log;
// colored loggers because the console ones (warn,error..) don't work for some reason
function log_info(i) {
    debug(`${Colors.fgBlue}${i}${Colors.reset}`);
}
function log_warn(i) {
    debug(`${Colors.fgYellow}${i}${Colors.reset}`);
}
function log_error(i) {
    debug(`${Colors.fgRed}${i}${Colors.reset}`);
}
function log_success(i) {
    debug(`${Colors.fgGreen}${i}${Colors.reset}`);
}
const emitter = new EventEmitter();
// A basic queue structure for unresolved requests
class Requests_Queue {
    constructor() { }
    queue = [];
    enqueue(request) {
        this.queue.push(request);
    }
    dequeue() {
        return this.queue.shift();
    }
    peek() {
        return this.queue[0];
    }
    isEmpty() {
        return this.queue.length === 0;
    }
}
const requests_queue = new Requests_Queue();
// events
async function on_taxi_available(taxi) {
    if (requests_queue.isEmpty()) {
        log_error("waiting queue is currently empty");
        return;
    }
    const pending_request = requests_queue.peek();
    if (pending_request) {
        emitter.emit("request_dispatch", pending_request);
        requests_queue.dequeue();
        return;
    }
}
async function on_request_dispatch(request) {
    find_available_taxi(request);
}
async function on_request_rejected(request) {
    log_warn(`all taxis are currently busy | request with id : ${request.reqId} is waiting`);
    requests_queue.enqueue(request);
}
async function on_request_accepted(data) {
    requests.push(data.request);
    data.taxi.timeRemaining = Math.abs(data.taxi.position - data.request.position) + Math.abs(data.request.position - data.request.destination);
    log_error(`total distance : ${data.taxi.timeRemaining}`);
    await initiate_taxi_start(data.taxi, (taxi) => {
        taxi.available = true;
        taxi.totalRides += 1;
        log_success(`\nrequest with id : ${data.request.reqId} was resolved`);
        emitter.emit("taxi_available", taxi);
    });
}
emitter.on("request_accepted", on_request_accepted);
emitter.on("request_rejected", on_request_rejected);
emitter.on("request_dispatch", on_request_dispatch);
emitter.on("taxi_available", on_taxi_available);
async function dispatch_request() {
    const request = {
        position: await number({
            message: "enter request position :",
            min: 1,
            max: positions_range,
            required: true,
        }),
        destination: await number({
            message: "enter destination :",
            min: 1,
            max: positions_range,
            required: true,
        }),
        reqId: request_counter++,
    };
    emitter.emit("request_dispatch", request);
}
async function dispatch_multiple_request() {
    log_info("requests that cannot be resolved immediately will be pushed to the waiting queue");
    const number_of_request = await number({
        message: "how many request you want to dispatch ? : ",
        min: 1,
        max: 20,
        required: true,
    });
    for (let i = 0; i < number_of_request; i++) {
        const request = {
            position: await number({
                message: "enter request position :",
                min: 1,
                max: positions_range,
                required: true,
            }),
            destination: await number({
                message: "enter destination :",
                min: 1,
                max: positions_range,
                required: true,
            }),
            reqId: request_counter++,
        };
        emitter.emit("request_dispatch", request);
    }
}
function print_stats() {
    log_success("\n========== SIMULATION STATISTICS ==========");
    log_info(`Total Requests Processed: ${requests.length}`);
    log_info(`Requests Waiting in Queue: ${requests_queue.queue.length}`);
    log_info(`\n--- Taxi Statistics ---`);
    taxis.forEach(taxi => {
        log_info(`Taxi ID: ${taxi.id}`);
        log_info(`  Position: ${taxi.position}`);
        log_info(`  Available: ${taxi.available ? "Yes" : "No"}`);
        log_info(`  Total Rides: ${taxi.totalRides}`);
    });
    log_success("\n==========================================\n");
}
function find_available_taxi(request) {
    const availableTaxis = taxis.filter((taxi) => taxi.available);
    if (availableTaxis.length === 0) {
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
    log_info(`closest taxi to request with id : ${request.reqId} is ${closest_taxi.position - request.position} unit(s) away`);
    emitter.emit("request_accepted", { taxi: closest_taxi, request });
}
async function initiate_taxi_start(taxi, onFinish) {
    if (taxi.timeRemaining <= 0)
        return;
    taxi.available = false;
    const interval = setInterval(() => {
        taxi.timeRemaining -= 1;
        if (taxi.timeRemaining <= 0) {
            clearInterval(interval);
            if (onFinish)
                onFinish(taxi);
            return;
        }
    }, 1000);
    return;
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
            case choices[1]:
                await dispatch_multiple_request();
                break;
            case choices[2]:
                print_stats();
                break;
            default:
                exit = true;
                break;
        }
    }
}
log(banner);
let exit = false;
while (!exit) {
    let answer = await select({
        message: "start simulation ?",
        choices: ["yes", "exit"],
    });
    if (answer === "yes") {
        await start_simulation();
    }
    else {
        exit = true;
    }
}
