# Mental Math Strategies & Algorithms

This document serves as the "brain" and source of truth for the application's teaching logic. It synthesizes techniques from **Singapore Math**, **Arthur Benjamin (Mathemagics)**, and **Vedic Mathematics**.

## 1. Addition Strategies

### 1.1 Left-to-Right Addition (The "Running Total")
*Source: Arthur Benjamin, Singapore Math*
Instead of the traditional right-to-left "carry" method, calculate from the largest place value to the smallest. This aligns with how we read numbers and speak answers.
- **Algorithm**:
    1. Break the second number into partials (Hundreds, Tens, Ones).
    2. Add the largest partial to the first number.
    3. Keep a "running total" and add the next partial.
- **Example**: `458 + 324`
    1. `458 + 300 = 758`
    2. `758 + 20 = 778`
    3. `778 + 4 = 782`

### 1.2 Number Bonds / Bridging to 10
*Source: Singapore Math*
Use "friendly numbers" (multiples of 10) as bridges.
- **Algorithm**:
    1. Identify distance to next multiple of 10.
    2. "Borrow" that amount from the other number.
- **Example**: `58 + 7`
    1. `58` needs `2` to become `60`.
    2. Split `7` into `2 + 5`.
    3. `58 + 2 = 60`.
    4. `60 + 5 = 65`.

## 2. Subtraction Strategies

### 2.1 Left-to-Right Subtraction
*Source: Arthur Benjamin*
Decompose the subtrahend (number being subtracted) and remove chunks from left to right.
- **Example**: `532 - 156`
    1. `532 - 100 = 432`
    2. `432 - 50 = 382`
    3. `382 - 6 = 376`

### 2.2 Complementary Numbers (All from 9, Last from 10)
*Source: Vedic Math*
Best for subtracting from powers of 10 (100, 1000, etc.).
- **Algorithm**: Subtract every digit from 9, except the last non-zero digit, which you subtract from 10.
- **Example**: `1000 - 357`
    1. `9 - 3 = 6`
    2. `9 - 5 = 4`
    3. `10 - 7 = 3`
    - Result: `643`

### 2.3 Compensation (Over-subtracting)
*Source: Singapore Math*
If the number to subtract is close to a round number (ending in 8 or 9), subtract the round number and add back the difference.
- **Example**: `84 - 39`
    1. Treat `39` as `40`.
    2. `84 - 40 = 44`.
    3. Added `1` too many, so add it back: `44 + 1 = 45`.

## 3. Multiplication Strategies

### 3.1 Squaring Numbers Ending in 5
*Source: Vedic Math*
- **Algorithm**:
    1. Take the digit(s) before the 5. Call it `n`.
    2. Multiply `n` by `n + 1`.
    3. Append `25` to the result.
- **Example**: `35²`
    1. `n = 3`.
    2. `3 × (3 + 1) = 12`.
    3. Result: `1225`.

### 3.2 Multiplying by 11
*Source: Vedic Math*
- **Algorithm** (2-digit numbers):
    1. Split the digits.
    2. Add them together.
    3. Place sum in the middle. (Carry if sum > 9).
- **Example**: `23 × 11`
    1. `2` and `3`. Sum is `5`.
    2. Result: `253`.
- **Example**: `48 × 11`
    1. `4` and `8`. Sum is `12`.
    2. `4 (12) 8` -> Add `1` to `4`.
    3. Result: `528`.

### 3.3 Doubling and Halving
*Source: Russian Peasant / Standard Mental Math*
When multiplying two numbers, if one is even, you can halve it and double the other to make the problem easier.
- **Example**: `14 × 16`
    1. Halve `14` -> `7`.
    2. Double `16` -> `32`.
    3. `7 × 32` (Easier: `7 × 30 = 210`, `7 × 2 = 14` -> `224`).

### 3.4 Cross-Multiplication (Vertically and Crosswise)
*Source: Vedic Math (Urdhva Tiryakbhyam)*
General method for 2-digit multiplication `AB × CD`.
- **Algorithm**:
    1. **Right Vertical**: `B × D` (Write ones, carry tens).
    2. **Crosswise**: `(A × D) + (B × C) + carry`. (Write ones, carry tens).
    3. **Left Vertical**: `(A × C) + carry`.
- **Example**: `21 × 31`
    1. `1 × 1 = 1`. (Result ends in `1`)
    2. `(2×1) + (1×3) = 2 + 3 = 5`. (Middle digit `5`)
    3. `2 × 3 = 6`. (First digit `6`)
    - Result: `651`.

## 4. Division Strategies

### 4.1 "Double and Divide" (for dividing by 5, 50, 500)
- **Algorithm**: To divide by 5, double the number and divide by 10.
- **Example**: `240 ÷ 5`
    1. Double `240` -> `480`.
    2. Divide by 10 -> `48`.

### 4.2 Proportional Division (Canceling Zeroes/Factors)
- **Algorithm**: Simplify the fraction before dividing.
- **Example**: `840 ÷ 24`
    1. Both divisible by 12? `84/12 = 7`, so `70`. `24/12 = 2`.
    2. `70 ÷ 2 = 35`.

### 4.3 Estimation via Rounding
- **Algorithm**: Round divisor and dividend to simplify, then adjust.
- **Use Case**: Checking reasonableness of answers.

## Implementation Guide for Tutor Engine
- **Pre-Computation**: When generating a problem, check properties (ends in 5? multiple of 11? close to 100?) to select the best hint.
- **Fallback**: Always default to "Running Total" (Left-to-Right) for general addition/subtraction if no special trick applies.
