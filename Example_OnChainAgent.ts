/**
 * This is an Example for Agent in CryptoAgentOS.
 * 
 * This file should be placed in ./CryptoAgentOS/src/
 * You should implement the Services, Actions in YOUR-AGENT 
 * and extract them to ./CryptoAgentOS/src/services 
 * or ./CryptoAgentOS/src/actions as a sigle (Service/Action) file.
 * 
 * Notice: This file is still under development.
 * 
 * Update at 2025/08/13
 */

import { Service, IAgentRuntime, logger } from "@elizaos/core";
import { ApiService } from "../src/services/ApiService";
import {
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State, 
    type Action,
    MessageMemory,
    EventType,
    logger,
    asUUID,
    composePromptFromState,
} from "@elizaos/core";

import * as fs from 'fs';

export const ExampleAgentAction: Action = {
    name: "EXAMPLE_ACTION",
    similes: [
        "EXAMPLE_AGENT_ACTION"
    ],
    description: "An example action of agent",
    validate: async (_runtime: IAgentRuntime, _message: MessageMemory, _state: State) => {
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state:State,
        _options:{[key:string]:unknown},
        callback: HandlerCallback,
        _responses: Memory[]
    ): Promise<void> => {
        try {
            const apiService = runtime.getService(ApiService.serviceType) as ApiService;

            // load your Service and do something
            const exampleService = runtime.getService(ExampleAgentService.serviceType) as ExampleAgentService;
            await exampleService.getDataFromInternet();
            const prompt = exampleService.generatePrompt();
            // Use LLMs to generate a response
            let resp = await apiService.tryToCallLLMsWithoutFormat(prompt, false, true);
            exampleService.sendReportToApiService(resp);
            if(callback){
                // callback: send a message to UI.
                callback({
                    thought:
                    `${resp}`,
                    text:
                    `EXAMPLE_ACTION done, response text: ${resp}`,
                });
            }

            return;
        } catch (error) {
            // log in console
            logger.error("Error in EXAMPLE_ACTION:", error);

            // send error message to UI
            if(callback){
                callback({
                    text:`
                    Error in EXAMPLE_ACTION:
                    ${error}
                    `
                });
                return;
            }
            return;
        }
    },
    examples: [
    ],
} as Action;

export type DataSource = 'INTERNET'|'LOCAL'|'UNDEFINED';

export type AgentType = 'ONCHAIN'|'OFFCHAIN'|'RELECT'|'TRADE'|'UNDEFINED';

export interface ExampleOnChainData{
    symbol:string,
    price:number,
    time:string,
}
  
export interface ExampleOffChainData{
    id:number,
    url:string,
    title:string,
    time:string,
    content:string,
}

export class ExampleAgentService extends Service {
    static serviceType = 'ExampleAgentService';
    apiService:ApiService|undefined;
    dataSource:DataSource;
    agentType:AgentType;
    data:ExampleOnChainData[];
    capabilityDescription =
        'This is a task service which is attached to the agent through the CryptoAgentOS.';

    constructor(runtime: IAgentRuntime) {
        super(runtime);
    }
    
    static async start(runtime: IAgentRuntime) {
        logger.info(`*** Starting ExampleAgentService - MODIFIED: ${new Date().toISOString()} ***`);
        const service = new ExampleAgentService(runtime);
        // load instance of ApiService
        service.apiService = runtime.getService(ApiService.serviceType) as ApiService;
        // load or init some args
        service.setAgentType('ONCHAIN');
        service.setDataSource('LOCAL');
        service.data = [];
        // TODO
        return service;
    }

    static async stop(runtime: IAgentRuntime) {
        logger.info('*** TESTING DEV MODE - STOP MESSAGE CHANGED! ***');
        // get the service from the runtime
        const service = runtime.getService(ExampleAgentService.serviceType);
        if (!service) {
            throw new Error('ExampleAgentService not found');
        }
        service.stop();
    }

    async stop() {
        logger.info('*** THIRD CHANGE - TESTING FILE WATCHING! ***');
        // clear and stop

        // TODO
    }


    public async getDataFromInternet(){
        // TODO
        const new_data:ExampleOnChainData = {
            symbol: "BTCUSDT",
            price: 119477.00,
            time: "2025-08-13:12:52:00"
        }
        this.data.push(new_data);
    }

    private saveDataToLocalFile(){
        // TODO
        let data_file = fs.openSync('./data/my_data_file_name', 'a');
        for(let i = 0; i < this.data.length; i++){
            fs.writeFileSync(data_file, JSON.stringify(this.data[i]) + '\n');
        }
        fs.closeSync(data_file);
        // ......
    }

    private loadDataFromLocalFile(){
        // TODO
    }

    public exampleFunction(){
        return 'Hello World!';
    }

    public generatePrompt(chain = 'BTC'):string{
        let prompt = "You are an " + chain + 
        " cryptocurrency trading analyst. The recent price and auxiliary information is given in chronological order below:\n";
        for(let i = 0; i < this.data.length; i++){
            if(this.data[i].symbol === chain){
                prompt += `Price: ${this.data[i].price}, Time: ${this.data[i].time};\n`;
            }
        }
        prompt += 'Write one concise paragraph to analyze the recent information and estimate the market trend accordingly.';
        return prompt;
    }

    public setDataSource(source:DataSource){
        this.dataSource = source;
    }

    public setAgentType(type:AgentType){
        this.agentType = type;
    }

    public sendReportToApiService(report:string|undefined){
        switch(this.agentType){
            case 'ONCHAIN':
                this.apiService.saveOnChainReport(report);
                break;
            case 'OFFCHAIN':
                this.apiService.saveOffChainReport(report);
                break;
            case 'RELECT':
                this.apiService.saveReflectReport(report);
                break;
            case 'TRADE':
                this.apiService.saveTradeReport();
                break;
            case 'UNDEFINED':
                throw new Error(`AgentType UNDEFINED`);
            default:
                throw new Error(`UnSupported AgentType`);
        }
    }
}