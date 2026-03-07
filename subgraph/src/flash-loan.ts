import { BigInt } from "@graphprotocol/graph-ts";
import { FlashLoan as FlashLoanEvent } from "../../contracts/out/DeFiFlashLoan.sol/DeFiFlashLoan";
import { FlashLoanEvent as FlashLoanEntity } from "../generated/schema";

export function handleFlashLoan(event: FlashLoanEvent): void {
    let entity = new FlashLoanEntity(
        event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    );
    entity.borrower = event.params.borrower;
    entity.token = event.params.token;
    entity.amount = event.params.amount;
    entity.fee = event.params.fee;
    entity.timestamp = event.block.timestamp;
    entity.blockNumber = event.block.number;
    entity.save();
}
