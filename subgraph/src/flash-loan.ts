import { BigInt } from "@graphprotocol/graph-ts";
import { FlashLoanExecuted as FlashLoanExecutedEvent } from "../../contracts/out/DeFiFlashLoan.sol/DeFiFlashLoan";
import { FlashLoanEvent } from "../generated/schema";

export function handleFlashLoanExecuted(
    event: FlashLoanExecutedEvent
): void {
    let entity = new FlashLoanEvent(
        event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    );
    entity.initiator = event.params.initiator;
    entity.borrower = event.params.borrower;
    entity.token = event.params.token;
    entity.amount = event.params.amount;
    entity.fee = event.params.fee;
    entity.timestamp = event.params.timestamp;
    entity.blockNumber = event.block.number;
    entity.save();
}
