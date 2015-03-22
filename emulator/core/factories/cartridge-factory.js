var tvSystemToString  = require("../common/types").TVSystem.toString;
var mirroringToString = require("../common/types").Mirroring.toString;
var INESLoader        = require("../loaders/ines-loader");
var NES2Loader        = require("../loaders/nes2-loader");
var ArrayBufferReader = require("../readers/array-buffer-reader");
var LocalFileReader   = require("../readers/local-file-reader");
var readableSize      = require("../utils/format").readableSize;
var readableBytes     = require("../utils/format").readableBytes;
var logger            = require("../utils/logger").get();

//=========================================================
// Factory for cartridge creation
//=========================================================

class CartridgeFactory {

    constructor() {
        this.loaders = [
            new INESLoader, // Must be processed before iNES
            new NES2Loader
        ];
    }

    fromArrayBuffer(buffer) {
        logger.info("Loading cartridge from array buffer");
        return this.fromReader(new ArrayBufferReader(buffer));
    }

    fromLocalFile(path) {
        logger.info(`Loading cartridge from '${path}'`);
        return this.fromReader(new LocalFileReader(path));
    }

    fromReader(reader) {
        for (var loader of this.loaders) {
            if (loader.supports(reader)) {
                logger.info(`Using '${loader.name}' loader`);
                var cartridge = loader.load(reader);
                this.printCartridgeInfo(cartridge);
                return cartridge;
            }
        }
        throw new Error("Unsupported input data format.");
    }

    printCartridgeInfo(cartridge) {
        var ref, ref1;
        logger.info("==========[Cartridge Info - Start]==========");
        logger.info("Mapper ID             : " + cartridge.mapperId);
        logger.info("Sub-mapper ID         : " + cartridge.subMapperId);
        logger.info("has PRG RAM           : " + cartridge.hasPRGRAM);
        logger.info("has PRG RAM battery   : " + cartridge.hasPRGRAMBattery);
        logger.info("has CHR RAM           : " + cartridge.hasCHRRAM);
        logger.info("has CHR RAM battery   : " + cartridge.hasCHRRAMBattery);
        logger.info("has BUS conflicts     : " + cartridge.hasBUSConflicts);
        logger.info("has trainer           : " + cartridge.hasTrainer);
        logger.info("PRG ROM size          : " + readableSize(cartridge.prgROMSize || cartridge.prgROM.length));
        logger.info("PRG RAM size          : " + readableSize(cartridge.prgRAMSize));
        logger.info("PRG RAM size (battery): " + readableSize(cartridge.prgRAMSizeBattery));
        logger.info("CHR ROM size          : " + readableSize(cartridge.chrROMSize || cartridge.chrROM.length));
        logger.info("CHR RAM size          : " + readableSize(cartridge.chrRAMSize));
        logger.info("CHR RAM size (battery): " + readableSize(cartridge.chrRAMSizeBattery));
        logger.info("Mirroring             : " + mirroringToString(cartridge.mirroring));
        logger.info("TV system             : " + tvSystemToString(cartridge.tvSystem));
        logger.info("is Vs Unisistem       : " + cartridge.isVsUnisistem);
        logger.info("is PlayChoice         : " + cartridge.isPlayChoice);
        logger.info("Trainer               : " + readableBytes(cartridge.trainer));
        logger.info("==========[Cartridge Info - End]==========");
    }

}

module.exports = CartridgeFactory;