#include "Trie.h"

Trie::Trie()
{
    root = new TrieNode();
}

void Trie::insert(string word)
{
    TrieNode* current = root;

    for(char c : word)
    {
        int index = c - 'a';

        if(current->children[index] == nullptr)
        {
            current->children[index] = new TrieNode();
        }

        current = current->children[index];
    }

    current->isEndOfWord = true;
}

bool Trie::search(string word)
{
    TrieNode* current = root;

    for(char c : word)
    {
        int index = c - 'a';

        if(current->children[index] == nullptr)
        {
            return false;
        }

        current = current->children[index];
    }

    return current->isEndOfWord;
}

bool Trie::startsWith(string prefix)
{
    TrieNode* current = root;

    for(char c : prefix)
    {
        int index = c - 'a';

        if(current->children[index] == nullptr)
        {
            return false;
        }

        current = current->children[index];
    }

    return true;
}

void Trie::displayWords(TrieNode* node, string word)
{
    if(node == nullptr)
        return;

    if(node->isEndOfWord)
    {
        cout << word << endl;
    }

    for(int i = 0; i < 26; i++)
    {
        if(node->children[i] != nullptr)
        {
            char ch = 'a' + i;
            displayWords(node->children[i], word + ch);
        }
    }
}

void Trie::autoComplete(string prefix)
{
    TrieNode* current = root;

    for(char c : prefix)
    {
        int index = c - 'a';

        if(current->children[index] == nullptr)
        {
            cout << "No words found!" << endl;
            return;
        }

        current = current->children[index];
    }

    cout << "\nWords Found:\n";

    displayWords(current, prefix);
}

// ---------- Delete Functions ----------

bool Trie::isEmpty(TrieNode* node)
{
    for(int i = 0; i < 26; i++)
    {
        if(node->children[i] != nullptr)
            return false;
    }

    return true;
}

TrieNode* Trie::removeWord(TrieNode* node, string word, int depth)
{
    if(node == nullptr)
        return nullptr;

    if(depth == word.length())
    {
        if(node->isEndOfWord)
            node->isEndOfWord = false;

        if(isEmpty(node))
        {
            delete node;
            return nullptr;
        }

        return node;
    }

    int index = word[depth] - 'a';

    node->children[index] =
        removeWord(node->children[index], word, depth + 1);

    if(isEmpty(node) && node->isEndOfWord == false)
    {
        delete node;
        return nullptr;
    }

    return node;
}

void Trie::remove(string word)
{
    root = removeWord(root, word, 0);

    if(root == nullptr)
    {
        root = new TrieNode();
    }
}