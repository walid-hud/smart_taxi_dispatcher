export interface Taxi {
	id: number;
	position: number;
	available: boolean;
	timeRemaining: number;
	totalRides: number;
}
export interface Request {
	reqId: number;
	position: number;
	duration: number;
}
export interface IRequestsQueue {
	queue: Request[];
	queue_size: number;
}
export interface IWaitingQueue{
    queue: Request[]
}



// these are some ANSI escape codes to format the output text
export const Colors = {
	reset: "\x1b[0m",
	bold: "\x1b[1m",
	dim: "\x1b[2m",
	italic: "\x1b[3m",
	underline: "\x1b[4m",
	inverse: "\x1b[7m",
	hidden: "\x1b[8m",
	strikethrough: "\x1b[9m",
	fgBlack: "\x1b[30m",
	fgRed: "\x1b[31m",
	fgGreen: "\x1b[32m",
	fgYellow: "\x1b[33m",
	fgBlue: "\x1b[34m",
	fgMagenta: "\x1b[35m",
	fgCyan: "\x1b[36m",
	fgWhite: "\x1b[37m",
	fgGray: "\x1b[90m",
	bgBlack: "\x1b[40m",
	bgRed: "\x1b[41m",
	bgGreen: "\x1b[42m",
	bgYellow: "\x1b[43m",
	bgBlue: "\x1b[44m",
	bgMagenta: "\x1b[45m",
	bgCyan: "\x1b[46m",
	bgWhite: "\x1b[47m",
	bgGray: "\x1b[100m",
};

export const banner = `${Colors.fgYellow}                                                                                                        
  ██████  ▄▄▄  ▄▄ ▄▄ ▄▄   ████▄  ▄▄  ▄▄▄▄ ▄▄▄▄   ▄▄▄  ▄▄▄▄▄▄  ▄▄▄▄ ▄▄ ▄▄ ▄▄▄▄▄ ▄▄▄▄    ▄█████ ▄▄ ▄▄   ▄▄ 
    ██   ██▀██ ▀█▄█▀ ██   ██  ██ ██ ███▄▄ ██▄█▀ ██▀██   ██   ██▀▀▀ ██▄██ ██▄▄  ██▄█▄   ▀▀▀▄▄▄ ██ ██▀▄▀██ 
    ██   ██▀██ ██ ██ ██   ████▀  ██ ▄▄██▀ ██    ██▀██   ██   ▀████ ██ ██ ██▄▄▄ ██ ██   █████▀ ██ ██   ██
${Colors.reset}
`;

export const taxis: Taxi[] = [
	{ id: 1, position: 0, available: true, timeRemaining: 0, totalRides: 0 },
	{ id: 2, position: 5, available: true, timeRemaining: 0, totalRides: 0 },
	{ id: 3, position: 10, available: true, timeRemaining: 0, totalRides: 0 },
	{ id: 4, position: 3, available: true, timeRemaining: 0, totalRides: 0 },
];