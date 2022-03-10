By odpalić aplikację należy:
- pobrać pliki i uruchomić projekt w terminalu
- npm i
- skopiować i importować bazę danych (plik jutro.sql) do bazy danych (MariaDb)
- 'npm run start' lub 'npm run start:dev' dla środowiska developerskiego
- dane takie, jak data urocdzin, miejsce urodzin, czas przed którym można zmienić status obecności, czy nazwa ciasteczka znajduje się w pliku /utils/variables.ts

Alternatywnie zamieściłem aplikację na Replit.it pod tym linkiem:
https://replit.com/@iwomipl/Birthday-Guest-List
Działają tam wszystkie jej funkcje (podłączyłem aplikację do zewnętrznej bazy danych) poza funkcją pobierania listy gości. Być może jest to związane z brakiem możliwości zapisywania plików przez sam serwer.
By uruchomić aplikację na repl.it wystarczy kliknąć w zielony przycisk z napisem "Run", poczekać chwilę (czasem dłuższą) 
i po uruchomieniu kliknąć w napis "Open website". Ostatni krok nie jest konieczny, 
ale znacznie wygodniej używa się aplkikacji w pełnym oknie. W Repl.it tez można przeglądać pliki, 
jednak mogą trochę różnic się od tych gitowych, 
ponieważ musiałem dokonać kilku zmian ze względu na inne środowisko uruchomienia.

Aplikacja pozwala na:
- stworzenie listy gości. (imię, nazwisko) - menu "Wszyscy"
- oznaczenie osób, które potwierdziły swoją obecność. Zakładamy, że jeśli osoba nie potwierdziła udziału,
  nie będzie uczestniczyć w imprezie, - menu "Obecni"
- odwołanie swojej obecności, ale nie później niż na 5 godzin przed rozpoczęciem imprezy. Osoba, która
  odwołała swoją obecność może ponownie się zgłosić, ale również musi zrobić to na max. 5 godzin przed
  rozpoczęciem, - menu "Ustawienia" przycisk "Będę"/"Nie będę" zależnie od wybranej opcji
wyświetlenie osób które:
- przyjdą na Twoją imprezę,- menu "Obecni"
- nie będą uczestniczyć w imprezie, - menu "Nieobecni"
- odwołali swoją obecność i kiedy tego dokonali. - menu "Zrezygnowali"
pobranie pliku z informacjami przez uczestnika imprezy, które powinno zawierać: - menu "Pobierz listę gości"
- imię i nazwisko uczestnika dla którego jest potwierdzenie,
- datę, godzinę i miejsce imprezy,
- listę gości, którzy pojawią się na imprezie.

Dodatkowo zrobiłem możliwość usunięcia aktualnego użytkownika w ustawieniach.
Kliknięcie "Dodaj gościa" umożliwia dodanie osoby do listy lub w przypadku użycia istniejących już danych,
zalogowanie jako wskazany gość. Role w zadaniu nie miały mieć znaczenia, 
dlatego też stworzyłem tak prostą metodę przejmowania tożsamości.
Większość błędów opisuje co należy zrobić, by przejść właściwą walidację. 
Np. nie wejdziemy w "Ustawienia" ani nie pobierzemy listy gości bez zalogowania jako jeden z gości urodzin.
Są trzy kategorie gości:
Obecność potwierdzona - niebieski pasek z imieniem, nazwiskiem i napisem "Obecność potwierdzona"
Obecnośc potwierdzona, ale wycofana - czerwony pasek z imieniem, nazwiskiem i napisem "Czas zgłoszenia nieobecności" "data i godzina"
Obecność niepotwierdzona - czerwony pasek z imieniem, nazwiskiem i napisem bez dopisku.

Decyzje projektowe:
- DB - MariaDb, mimo, że wolniejsza niż PostgreSQL, to wystarczająca do małego projektu. 
- API Rest
- ExpressHandleBars z ućzyciem helperów - niby wygląd nie ma wielkiego znaczenia, ale handlebarsy bardzo to ułatwiają.
- Funkcje asynchroniczne - starałem się unikać zajmowania Call Stacka, funkcje, które mogłem zrobić asynchroniczne takie są.
- Wzorzec projektowy Active Record
- zmienną dateOfBirthday umieściłem w (ponoć) formacie ułatwiającym jego obsługę przez baz danych,
- Staralem się w projekcie jak najczęściej korzystać za bazy danych, jest szybsza w wyszukiwaniu informacji, a funkcje asynchroniczne pozwalają serwerowi zająć się następnym zadaniem w Call Stacku.
- Po wysłaniu wygenerowanego pliku z listą gości, kasuję go z folderu.
- 



