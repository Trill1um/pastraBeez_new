// WEEKLY CHALLENGE 1

import java.util.*;

class Roman {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        
        String[] letter = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};
        int[] value = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
        int pointer = 0;
        String ans = "";
        
        System.out.print("Enter number: ");
        int n = input.nextInt();
        
        while (n > 0) {
            if (n >= value[pointer]) {
                ans += letter[pointer];
                n -= value[pointer];
            } else {
                pointer++;
            }
        }
        
        System.out.print("Roman Numeral: " + ans);
    }
}