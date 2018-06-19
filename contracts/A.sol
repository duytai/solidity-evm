pragma solidity ^0.4.16;

contract A {
  uint8 x = 100;
  constructor(uint8 init) public {
    x = init;
  }
  function getX() public view returns (uint8) {
    return x;
  }
}
