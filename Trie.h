#ifndef TRIE_H
#define TRIE_H

#include <iostream>
using namespace std;

class TrieNode
{
public:
    TrieNode* children[26];
    bool isEndOfWord;

    TrieNode()
    {
        isEndOfWord = false;

        for(int i = 0; i < 26; i++)
        {
            children[i] = nullptr;
        }
    }
};

class Trie
{
private:
    TrieNode* root;

    // Helper functions for deletion
    bool isEmpty(TrieNode* node);
    TrieNode* removeWord(TrieNode* node, string word, int depth);

public:
    Trie();

    void insert(string word);

    bool search(string word);

    bool startsWith(string prefix);

    void displayWords(TrieNode* node, string word);

    void autoComplete(string prefix);

    // Delete word from Trie
    void remove(string word);
};

#endif