pragma solidity ^0.4.16;

contract A {
    function showLog() public {
        log0(bytes32(msg.sender));
        log0(bytes32(tx.origin));   
    }
}

contract B {
    constructor(address a) public {
        a.call(bytes4(keccak256("showLog()")));
    }
}
