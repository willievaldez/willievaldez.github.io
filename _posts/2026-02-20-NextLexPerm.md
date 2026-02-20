---
layout: post
title: Next Lexographical Permutation
tags: [C++, Hackerrank]
---

I've been trying my hand at a few hackerrank problems, and ran into one that didn't discuss a solution I was satisfied with.
The problem in question is called [Bigger is Greater](https://www.hackerrank.com/challenges/bigger-is-greater/problem).

To try and simplify the question, let's pretend that there's a dictionary with every possible arrangement of letters.
It's still sorted the way we expect it to e.g. "sand" comes before "sane". Now, we are tasked with taking a word, and
rearranging any number of letters such that we get the closest word that comes *after* the given word in this dictionary.

So, breaking this down, in order to construct a word that comes after the given word, we must start by taking a "bigger" letter
and replacing it with a "smaller" letter that occurs earlier in the word. If we don't do this, the newly created word won't necessarily
come after the given word in our dictionary.

The next thing I noticed is that we should prioritize rearranging letters that are at the end of the word,
that would give us the change with the lowest impact on a word's "score". So, my first plan of action is
iterating over each position starting from the end of the string, and for each position, try to find any
letters after the current position that are greater than the letter at the current position. If we find one,
we can just swap those two letters in place.

Now, the final bit. After the swap, we still haven't completely solved the problem. after making the swap, all bets are
off regarding the arrangement of the letters *after* the swapped position, so we should just sort the letters after the swap.
This will minimize the spash damage on our new word's "score".

The whole solution is incredibly compact in C++:

```cpp
string biggerIsGreater(string w) {
    // Starting from the end of the string, evaluate each position (i)
    for (int i = w.length() - 2; i >= 0; --i)
    {
        //  Look at the letters *after* the current position (j)
        for (int j = w.length() - 1; j > i; --j)
        {
            // If a greater letter is found, swap them and
            // sort the remaining substring
            if (w[j] > w[i])
            {
                swap(w[j], w[i]);
                sort(w.begin()+i+1, w.end());
                return w;
            }
        }
    }
    
    return "no answer";
}
```
If we really wanted to optimize this, we could probably sort the remaining substring while we are iterating and finding candidates
for the swap, but I'll leave that as an exercise to the reader :)

> **Disclaimer**: The simplest solution is to use the [std::next_permutation](https://en.cppreference.com/w/cpp/algorithm/next_permutation.html) method,
> but I consider that cheating for this exercise
