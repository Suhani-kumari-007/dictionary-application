#include "Database.h"
#include <fstream>

Database::Database()
{
    db = nullptr;
}

bool Database::connect()
{
    if(sqlite3_open("dictionary.db", &db) == SQLITE_OK)
    {
        cout << "Database Connected Successfully!" << endl;
        return true;
    }

    cout << "Database Connection Failed!" << endl;
    return false;
}

void Database::createTable()
{
    string sql =
    "CREATE TABLE IF NOT EXISTS dictionary("
    "id INTEGER PRIMARY KEY AUTOINCREMENT,"
    "word TEXT NOT NULL UNIQUE,"
    "meaning TEXT NOT NULL);";

    char *errMsg = nullptr;

    if(sqlite3_exec(db, sql.c_str(), NULL, NULL, &errMsg) == SQLITE_OK)
    {
        cout << "Dictionary Table Ready!" << endl;
    }
    else
    {
        cout << "Error: " << errMsg << endl;
        sqlite3_free(errMsg);
    }
}

bool Database::insertWord(string word, string meaning)
{
    string sql =
    "INSERT INTO dictionary(word,meaning) VALUES(?,?);";

    sqlite3_stmt *stmt;

    if(sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, NULL)!=SQLITE_OK)
    {
        return false;
    }

    sqlite3_bind_text(stmt,1,word.c_str(),-1,SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt,2,meaning.c_str(),-1,SQLITE_TRANSIENT);

    bool success = false;

    if(sqlite3_step(stmt)==SQLITE_DONE)
        success=true;

    sqlite3_finalize(stmt);

    return success;
}

void Database::loadWords(Trie &trie)
{
    string sql = "SELECT word FROM dictionary;";

    sqlite3_stmt *stmt;

    if(sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, NULL) != SQLITE_OK)
    {
        cout << "Failed to load words!" << endl;
        return;
    }

    while(sqlite3_step(stmt) == SQLITE_ROW)
    {
        string word = (const char*)sqlite3_column_text(stmt, 0);
        trie.insert(word);
    }

    sqlite3_finalize(stmt);
}

string Database::getMeaning(string word)
{
    string sql =
    "SELECT meaning FROM dictionary WHERE word=?;";

    sqlite3_stmt *stmt;

    if(sqlite3_prepare_v2(db,sql.c_str(),-1,&stmt,NULL)!=SQLITE_OK)
        return "";

    sqlite3_bind_text(stmt,1,word.c_str(),-1,SQLITE_TRANSIENT);

    string meaning="";

    if(sqlite3_step(stmt)==SQLITE_ROW)
    {
        meaning=(const char*)sqlite3_column_text(stmt,0);
    }

    sqlite3_finalize(stmt);

    return meaning;
}

bool Database::deleteWord(string word)
{
    string sql = "DELETE FROM dictionary WHERE word=?;";

    sqlite3_stmt *stmt;

    if(sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, NULL) != SQLITE_OK)
        return false;

    sqlite3_bind_text(stmt, 1, word.c_str(), -1, SQLITE_TRANSIENT);

    bool success = false;

    if(sqlite3_step(stmt) == SQLITE_DONE)
    {
        if(sqlite3_changes(db) > 0)
            success = true;
    }

    sqlite3_finalize(stmt);

    return success;
}

bool Database::updateMeaning(string word, string meaning)
{
    string sql = "UPDATE dictionary SET meaning=? WHERE word=?;";

    sqlite3_stmt* stmt;

    if(sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK)
    {
        cout << "Preparation Failed!" << endl;
        return false;
    }

    sqlite3_bind_text(stmt, 1, meaning.c_str(), -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 2, word.c_str(), -1, SQLITE_STATIC);

    if(sqlite3_step(stmt) != SQLITE_DONE)
    {
        cout << "Update Failed!" << endl;
        sqlite3_finalize(stmt);
        return false;
    }

    bool updated = sqlite3_changes(db) > 0;

    sqlite3_finalize(stmt);

    return updated;
}

void Database::displayAllWords()
{
    string sql = "SELECT word, meaning FROM dictionary ORDER BY word;";

    sqlite3_stmt* stmt;

    if(sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK)
    {
        cout << "Failed to retrieve words!" << endl;
        return;
    }

    cout << "\n==============================\n";
    cout << "Dictionary Words\n";
    cout << "==============================\n";

    while(sqlite3_step(stmt) == SQLITE_ROW)
    {
        cout << "Word    : "
             << sqlite3_column_text(stmt, 0) << endl;

        cout << "Meaning : "
             << sqlite3_column_text(stmt, 1) << endl;

        cout << "------------------------------\n";
    }

    sqlite3_finalize(stmt);
}

int Database::countWords()
{
    string sql = "SELECT COUNT(*) FROM dictionary;";

    sqlite3_stmt* stmt;

    if(sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK)
    {
        cout << "Failed to count words!" << endl;
        return 0;
    }

    int count = 0;

    if(sqlite3_step(stmt) == SQLITE_ROW)
    {
        count = sqlite3_column_int(stmt, 0);
    }

    sqlite3_finalize(stmt);

    return count;
}
void Database::importFromFile(string filename, Trie &trie)
{
    ifstream file(filename);

    if(!file)
    {
        cout << "Unable to open file!" << endl;
        return;
    }

    string word, meaning;

    while(getline(file, word))
    {
        if(getline(file, meaning))
        {
            insertWord(word, meaning);
            trie.insert(word);
        }
    }

    file.close();

    cout << "Words Imported Successfully!" << endl;
}

void Database::close()
{
    sqlite3_close(db);
    cout << "Database Closed." << endl;
}