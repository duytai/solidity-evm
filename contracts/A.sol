pragma solidity ^0.4.16;

contract A {
    int x = 10;
    function getX() public view returns(int) {
        return x;
    }
}


contract B {
    function get() public view returns (int) {
       A a = new A();
       return a.getX();
    }
}
