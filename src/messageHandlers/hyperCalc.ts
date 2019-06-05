import MessageHandler from "../messageHandler";
import ExtendedInfo from "../extendedInfo";
import TwitchExtendedInfo from "../extendedInfos/twitchExtendedInfo";
import MessageFloodgate from "../messageFloodgate";

class HyperCalc implements MessageHandler {
	
	factorial(x) {
        	let result = 1;
        	for (let i = 1; i <= x; i++){
            		result = result * i;
        	}
        	return result;
    	}
	
	combine(a, b) {
        	return (this.factorial(a) / (this.factorial(b) * (this.factorial(a-b))));
    	}
	
	hyperDist(n,k,s,x) {
        	/* n - pop size
           	   k - successes in pop
           	   s - sample size
           	   x - successes in sample */
        	let kcx, nkcsx, ncs;
        	kcx = this.combine(k,x);
        	nkcsx = this.combine(n-k,s-x);
        	ncs = this.combine(n,s);
        	return ((kcx * nkcsx) / ncs)
    	}

	async handleMessage(responder: (content: string) => Promise<void>, content: string, info: ExtendedInfo | undefined) {
		let args[] = content.split(" ");
		if (args[0] != "!hyper")
			return;
		if (args.length == 5) {
			if (Number.isInteger(args[1])
			    && Number.isInteger(args[2])
			    && Number.isInteger(args[3])
			    && Number.isInteger(args[4])) {
				const pSize = Number(args[1]);
				const pSucc = Number(args[2]);
				const sSize = Number(args[3]);
				const sSucc = Number(args[4]);
				
				let prExact = this.hyperDist(pSize,pSucc,sSize,sSucc);
				let prLess=0, prMore=0;
				for (let i = 0; i <= calc.pSucc; i++){
					if (i < sSucc)
						prLess = prLess + this.hyperDist(pSize,pSucc,sSize,i);
					if (i > sSucc)
						prMore = prMore + this.hyperDist(pSize,pSucc,sSize,i);
    				}
				let prLessEqual = prLess + prExact;
				let prMoreEqual = prMore + prExact;
				
				responder(/*`Population size: ${pSize}
					Successes in population: ${pSucc}
					Sample size: ${sSize}
					Successes in sample: ${sSucc}*/
					`P(X = ${sSucc}): ${prExact}
					P(X < ${sSucc}): ${prLess}
					P(X <= ${sSucc}): ${prLessEqual}
					P(X > ${sSucc}): ${prMore}
					P(X >= ${sSucc}): ${prMoreEqual}`);
				
			} else {
				responder("this only works with integers, boyo");
			}
		} else {
			responder("Usage: !hyper population_size successes_in_population sample_size successes_in_sample");
		}
	}

}

export default HyperCalc;
