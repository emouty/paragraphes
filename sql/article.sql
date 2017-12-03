CREATE TABLE IF NOT EXISTS `article` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(100),
  PRIMARY KEY (`id`)
) AUTO_INCREMENT=1 ;

ALTER TABLE `paragraphes` ADD COLUMN article int(11);
