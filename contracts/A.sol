pragma solidity ^0.4.16;

contract A {
    int x = 1;
    function doubleX() public view returns (int) {
        return x * 2;
    }
    function getX(int loop) public view returns (int) {
        int temp = 0;
        for (int i = 0; i < loop; i++) {
            temp += doubleX();
        }
        return temp;
    }
}
