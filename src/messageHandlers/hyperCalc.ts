import MessageHandler from "../messageHandler";
import ExtendedInfo from "../extendedInfo";
import TwitchExtendedInfo from "../extendedInfos/twitchExtendedInfo";
import MessageFloodgate from "../messageFloodgate";

class HyperCalc implements MessageHandler {

	async handleMessage(responder: (content: string) => Promise<void>, content: string, info: ExtendedInfo | undefined) {
		let args[] = content.split(" ");
		if (args[0] != "!hyper")
			return;
		if (/^!fightan$/.test(content)) {
			responder("Why don't you play a real fighting game, like " + this._fightan[Math.floor(Math.random() * this._fightan.length)] + "?");
		}
	}

}

export default HyperCalc;
