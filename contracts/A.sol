pragma solidity ^0.4.16;

contract A {
    int x = 10;
    function getX() public view returns(int) {
        return x;
    }
}


contract B {
    function get(address addr) public view returns (int) {
       A a = A(addr);
       return a.getX();
    }
}
