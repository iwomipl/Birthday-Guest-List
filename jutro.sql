-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Czas generowania: 10 Mar 2022, 19:26
-- Wersja serwera: 10.4.16-MariaDB
-- Wersja PHP: 7.4.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Baza danych: `jutro`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `guests`
--

CREATE TABLE `guests` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT uuid(),
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `willCome` tinyint(1) NOT NULL DEFAULT 0,
  `resignedAt` timestamp NULL DEFAULT NULL,
  `startTime` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Zrzut danych tabeli `guests`
--

INSERT INTO `guests` (`id`, `name`, `lastName`, `willCome`, `resignedAt`, `startTime`) VALUES
('e827c3a6-8011-43e5-993f-3b396fae613f', 'Anusia', 'Żona', 1, NULL, '2022-03-10 15:52:27'),
('fa4d49c2-85cd-4cc3-808d-ac9cba01a72b', 'Iwcioe', 'Mąż', 1, NULL, '2022-03-10 15:52:40'),
('3a997208-a103-4b9f-af9b-d9da6dc08856', 'Ciocia', 'Malwira', 0, '2022-03-10 15:52:57', '2022-03-10 15:52:54'),
('4fd5290d-7f3b-4cb1-8a47-718ff6f06046', 'Kolejny', 'Gość', 0, '2022-03-10 17:43:55', '2022-03-10 17:40:23'),
('a6a600c8-fdd4-42b8-b3e7-cd1c434a3d01', 'Jagwiga', 'Śląska', 0, NULL, '2022-03-10 18:26:02');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
