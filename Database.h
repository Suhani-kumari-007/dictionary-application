#ifndef DATABASE_H
#define DATABASE_H

#include <iostream>
#include <string>
#include <sqlite3.h>
#include "Trie.h"

using namespace std;

class Database
{
private:
    sqlite3 *db;

public:
    Database();

    bool connect();

    void createTable();

    bool insertWord(string word, string meaning);

    void loadWords(Trie &trie);

    string getMeaning(string word);

    bool deleteWord(string word);

    bool updateMeaning(string word, string meaning);

    void displayAllWords();

    int countWords();

    void importFromFile(string filename, Trie &trie);

    void close();
};

#endif