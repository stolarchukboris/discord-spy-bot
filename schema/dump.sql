-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: spybot
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `communityevents`
--

DROP TABLE IF EXISTS `communityevents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `communityevents` (
  `eventId` varchar(36) NOT NULL,
  `guildId` varchar(20) NOT NULL,
  `eventHost` varchar(20) NOT NULL,
  `annsMessageId` varchar(20) DEFAULT NULL,
  `eventGameUrl` varchar(200) NOT NULL,
  `eventGameName` varchar(100) NOT NULL,
  `gameThumbnailUrl` varchar(200) NOT NULL,
  `eventStatus` tinyint NOT NULL DEFAULT '1',
  `eventTime` varchar(20) NOT NULL,
  `reminded` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`eventId`),
  UNIQUE KEY `eventTime` (`eventTime`),
  UNIQUE KEY `annsMessageId` (`annsMessageId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `eventannschannelsetting`
--

DROP TABLE IF EXISTS `eventannschannelsetting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventannschannelsetting` (
  `guildId` varchar(20) NOT NULL,
  `settingValue` varchar(20) NOT NULL,
  PRIMARY KEY (`guildId`),
  UNIQUE KEY `settingValue` (`settingValue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `eventpingrolesetting`
--

DROP TABLE IF EXISTS `eventpingrolesetting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventpingrolesetting` (
  `guildId` varchar(20) NOT NULL,
  `settingValue` varchar(20) NOT NULL,
  PRIMARY KEY (`guildId`),
  UNIQUE KEY `settingValue` (`settingValue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `eventusersrolessetting`
--

DROP TABLE IF EXISTS `eventusersrolessetting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventusersrolessetting` (
  `guildId` varchar(20) NOT NULL,
  `settingValue` varchar(20) NOT NULL,
  UNIQUE KEY `settingValue` (`settingValue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `modusersrolessetting`
--

DROP TABLE IF EXISTS `modusersrolessetting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modusersrolessetting` (
  `guildId` varchar(20) NOT NULL,
  `settingValue` varchar(20) NOT NULL,
  UNIQUE KEY `settingValue` (`settingValue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `serverlogschannelsetting`
--

DROP TABLE IF EXISTS `serverlogschannelsetting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `serverlogschannelsetting` (
  `guildId` varchar(20) NOT NULL,
  `settingValue` varchar(20) NOT NULL,
  PRIMARY KEY (`guildId`),
  UNIQUE KEY `settingValue` (`settingValue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `starboardchannelsetting`
--

DROP TABLE IF EXISTS `starboardchannelsetting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `starboardchannelsetting` (
  `guildId` varchar(20) NOT NULL,
  `settingValue` varchar(20) NOT NULL,
  PRIMARY KEY (`guildId`),
  UNIQUE KEY `settingValue` (`settingValue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `starboardmessages`
--

DROP TABLE IF EXISTS `starboardmessages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `starboardmessages` (
  `originMessage` varchar(20) NOT NULL,
  `starboardMessage` varchar(20) NOT NULL,
  `amountOfReactions` tinyint NOT NULL,
  PRIMARY KEY (`originMessage`),
  UNIQUE KEY `starboardMessage` (`starboardMessage`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `starboardreactionsmin`
--

DROP TABLE IF EXISTS `starboardreactionsmin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `starboardreactionsmin` (
  `guildId` varchar(20) NOT NULL,
  `settingValue` tinyint NOT NULL,
  PRIMARY KEY (`guildId`),
  UNIQUE KEY `settingValue` (`settingValue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `starboardreacttoownmsgs`
--

DROP TABLE IF EXISTS `starboardreacttoownmsgs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `starboardreacttoownmsgs` (
  `guildId` varchar(20) NOT NULL,
  `settingValue` tinyint(1) NOT NULL,
  PRIMARY KEY (`guildId`),
  UNIQUE KEY `settingValue` (`settingValue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-26 20:05:17
