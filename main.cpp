#include <iostream>
#include <string>

#include "Trie.h"
#include "Database.h"

using namespace std;

int main()
{
    Trie trie;
    Database database;

    database.connect();
    database.createTable();
    database.loadWords(trie);

    int choice;
    string word;
    string meaning;

    do
    {
        cout << "\n===== Dictionary Menu =====" << endl;
        cout << "1. Add Word" << endl;
        cout << "2. Search Word" << endl;
        cout << "3. Auto Complete" << endl;
        cout << "4. Delete Word" << endl;
        cout << "5. Update Meaning" << endl;
        cout << "6. Display All Words" << endl;
        cout << "7. Count Total Words" << endl;
        cout << "8. Import Words from File" << endl;
        cout << "9. Exit" << endl;

        cout << "\nEnter your choice: ";
        cin >> choice;

        switch(choice)
        {
            case 1:
            {
                cout << "Enter Word: ";
                cin >> word;

                cin.ignore();

                cout << "Enter Meaning: ";
                getline(cin, meaning);

                database.insertWord(word, meaning);
                trie.insert(word);

                break;
            }

            case 2:
            {
                cout << "Enter Word to Search: ";
                cin >> word;

                if(trie.search(word))
                {
                    cout << "\nWord Found!" << endl;
                    cout << "Meaning: "
                         << database.getMeaning(word)
                         << endl;
                }
                else
                {
                    cout << "Word Not Found!" << endl;
                }

                break;
            }

            case 3:
            {
                cout << "Enter Prefix: ";
                cin >> word;

                trie.autoComplete(word);

                break;
            }

            case 4:
            {
                cout << "Enter Word to Delete: ";
                cin >> word;

                if(database.deleteWord(word))
                {
                    trie.remove(word);

                    cout << "Word Deleted Successfully!" << endl;
                }
                else
                {
                    cout << "Word Not Found!" << endl;
                }

                break;
            }
            case 5:
            {
                cout << "Enter Word: ";
                cin >> word;

                cin.ignore();

                cout << "Enter New Meaning: ";
                getline(cin, meaning);

                if(database.updateMeaning(word, meaning))
                {
                    cout << "Meaning Updated Successfully!" << endl;
                }
                else
                {
                    cout << "Word Not Found!" << endl;
                }

                break;
            }
            case 6:
            {
                database.displayAllWords();
                break;
            }
            case 7:
            {
                cout << "\nTotal Words in Dictionary: "
                    << database.countWords() << endl;
                break;
            }
            case 8:
            {
                string filename;

                cout << "Enter File Name: ";
                cin >> filename;

                database.importFromFile(filename, trie);

                break;
            }
            case 9:
            {
                cout << "Thank You!" << endl;
                break;
            }

            default:
            {
                cout << "Invalid Choice!" << endl;
            }
        }

    } while(choice != 9);

    database.close();

    return 0;
}