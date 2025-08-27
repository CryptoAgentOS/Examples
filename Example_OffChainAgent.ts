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
    symbol:string,
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
    data:ExampleOffChainData[];
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
        service.setAgentType('OFFCHAIN');
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
        const new_data:ExampleOffChainData = {
            id: 123,
            symbol: "BTC",
            url: "https://crypto.news/bitcoin-price-could-hit-1m-chainlink-founder-says/",
            title: "Bitcoin price could hit $1m, Chainlink founder says",
            time: "Aug 27, 2025 at 02:33 AM GMT+8",
            content: "Bitcoin price continued its recent crash today, Aug. 26, reaching its lowest level since July 10. Summary: Sergey Nazarov believes that Bitcoin price has a strong path to $1 million over time.He sees the ongoing adoption by pension funds, hedge funds, and family offices as the next major catalyst  Other top analysts believe that the BTC price will continue rising over time. Bitcoin has entered a correction after falling 11% from its year-to-date high. Still, Sergey Nazarov, the founder of Chainlink , the $16 billion coin, believes that it can jump to $1 million over time. Chainlink’s founder delivers a bold Bitcoin price prediction In a CoinDesk interview, Nazarov became the latest major player to predict that Bitcoin price will jump to $1 million. With BTC trading at $109,000, it needs to jump by 817% to reach that target. Such a move would push its fully diluted valuation to $21 trillion, which is lower than gold’s valuation of $23 trillion.  Nazarov believes that the main catalyst for the next move to $1 million will be accumulation by sovereign wealth funds, family offices, and pension funds. He estimates that these funds may allocate at least 5% of their assets to crypto. Nazarov joins other popular individuals who have delivered bold Bitcoin price predictions. For example, Cardano’s Charles Hoskinson believes that it can jump to between $250,000 and $500,000 in the next 12 to 24 months, citing the rising crypto adoption, regulatory clarity, including the CLARITY Act, and Bitcoin DeFi adoption.",
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
        let prompt = `You are an ${chain.toUpperCase()} cryptocurrency trading analyst. There are some articles about cryptocurrency today, and an analyst has completed the summary. You are required to analyze the following summary of these articles:`;
        for(let i = 0; i < this.data.length; i++){
            if(this.data[i].symbol === chain){
                prompt += `Ttile: ${this.data[i].title}, Time: ${this.data[i].time}, Content: ${this.data[i].content};\n\n`;
            }
        }
        prompt += 'Write one concise paragraph to analyze the summary and estimate the market trend accordingly.';
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
                this.apiService!.saveOnChainReport(report);
                break;
            case 'OFFCHAIN':
                this.apiService!.saveOffChainReport(report);
                break;
            case 'RELECT':
                this.apiService!.saveReflectReport(report);
                break;
            case 'TRADE':
                this.apiService!.saveTradeReport();
                break;
            case 'UNDEFINED':
                throw new Error(`AgentType UNDEFINED`);
            default:
                throw new Error(`UnSupported AgentType`);
        }
    }
}