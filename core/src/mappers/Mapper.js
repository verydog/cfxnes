import {Mirroring} from '../enums';
import log from '../log';

export default class Mapper {

  //=========================================================
  // Initialization
  //=========================================================

  constructor(cartridge) {
    log.info('Initializing mapper');
    Object.assign(this, cartridge);
    this.initPRGRAM();
    this.initCHRRAM();
    this.initState();
  }

  connect(nes) {
    log.info('Connecting mapper');
    this.cpu = nes.cpu;
    this.ppu = nes.ppu;
    this.cpuMemory = nes.cpuMemory;
    this.ppuMemory = nes.ppuMemory;
    this.cpu.mapper = this;
    this.ppu.mapper = this;
    this.cpuMemory.mapper = this;
    this.ppuMemory.mapper = this;
  }

  disconnect() {
    log.info('Disconnecting mapper');
    this.ppuMemory.mapper = undefined;
    this.cpuMemory.maper = undefined;
    this.ppu.mapper = undefined;
    this.cpu.mapper = undefined;
    this.ppuMemory = undefined;
    this.cpuMemory = undefined;
    this.ppu = undefined;
    this.cpu = undefined;
  }

  reset() {
    log.info('Resetting mapper');
    this.resetPRGRAM();
    this.resetCHRRAM();
    this.resetState();
  }

  //=========================================================
  // Callbacks
  //=========================================================

  initState() {
  }

  resetState() {
  }

  write() {
  }

  tick() {
  }

  //=========================================================
  // PRG ROM
  //=========================================================

  mapPRGROMBank32K(srcBank, dstBank) {
    this.mapPRGROMBank8K(srcBank * 4, dstBank * 4, 4);
  }

  mapPRGROMBank16K(srcBank, dstBank) {
    this.mapPRGROMBank8K(srcBank * 2, dstBank * 2, 2);
  }

  mapPRGROMBank8K(srcBank, dstBank, count = 1) {
    const maxBank = (this.prgROMSize - 1) >> 13;
    for (let i = 0; i < count; i++) {
      this.cpuMemory.mapPRGROMBank(srcBank + i, (dstBank + i) & maxBank);
    }
  }

  //=========================================================
  // PRG RAM
  //=========================================================

  initPRGRAM() {
    if (this.prgRAMSize) {
      this.prgRAM = new Uint8Array(this.prgRAMSize);
      this.canReadPRGRAM = true; // PRG RAM read protection
      this.canWritePRGRAM = true; // PRG RAM write protection
      this.hasPRGRAMRegisters = false; // Whether mapper registers are in PRG RAM address space
    }
  }

  resetPRGRAM() {
    if (this.prgRAM) {
      this.prgRAM.fill(0, this.prgRAMSizeBattery); // Keep battery-backed part of PRGRAM
    }
  }

  mapPRGRAMBank8K(srcBank, dstBank) {
    const maxBank = (this.prgRAMSize - 1) >> 13;
    this.cpuMemory.mapPRGRAMBank(srcBank, dstBank & maxBank);
  }

  //=========================================================
  // CHR ROM/RAM
  //=========================================================

  initCHRRAM() {
    if (this.chrRAMSize) {
      this.chrRAM = new Uint8Array(this.chrRAMSize);
    }
  }

  resetCHRRAM() {
    if (this.chrRAM) {
      this.chrRAM.fill(0, this.chrRAMSizeBattery); // Keep battery-backed part of CHRRAM
    }
  }

  mapCHRBank8K(srcBank, dstBank) {
    this.mapCHRBank1K(srcBank * 8, dstBank * 8, 8);
  }

  mapCHRBank4K(srcBank, dstBank) {
    this.mapCHRBank1K(srcBank * 4, dstBank * 4, 4);
  }

  mapCHRBank2K(srcBank, dstBank) {
    this.mapCHRBank1K(srcBank * 2, dstBank * 2, 2);
  }

  mapCHRBank1K(srcBank, dstBank, count = 1) {
    const chrSize = this.chrROMSize || this.chrRAMSize;
    const maxBank = (chrSize - 1) >> 10;
    for (let i = 0; i < count; i++) {
      this.ppuMemory.mapPatternsBank(srcBank + i, (dstBank + i) & maxBank);
    }
  }

  //=========================================================
  // Non-volatile part of CHR RAM
  //=========================================================

  // Either there is battery-backed PRG RAM or battery-backed CHR RAM.
  // Only known game using battery-backed CHR RAM is RacerMate Challenge II.

  getNVRAMSize() {
    return this.prgRAMSizeBattery || this.chrRAMSizeBattery;
  }

  getNVRAM() {
    if (this.prgRAMSizeBattery) {
      return this.prgRAM.subarray(0, this.prgRAMSizeBattery);
    }
    if (this.chrRAMSizeBattery) {
      return this.chrRAM.subarray(0, this.chrRAMSizeBattery);
    }
    return null;
  }

  setNVRAM(data) {
    if (this.prgRAMSizeBattery) {
      this.prgRAM.set(data.subarray(0, this.prgRAMSizeBattery));
    } else if (this.chrRAMSizeBattery) {
      this.chrRAM.set(data.subarray(0, this.chrRAMSizeBattery));
    }
  }

  //=========================================================
  // Nametables mirroring
  //=========================================================

  setSingleScreenMirroring(area = 0) {
    this.ppuMemory.setNametablesMirroring(Mirroring.getSingleScreen(area));
  }

  setVerticalMirroring() {
    this.ppuMemory.setNametablesMirroring(Mirroring.VERTICAL);
  }

  setHorizontalMirroring() {
    this.ppuMemory.setNametablesMirroring(Mirroring.HORIZONTAL);
  }

  setFourScreenMirroring() {
    this.ppuMemory.setNametablesMirroring(Mirroring.FOUR_SCREEN);
  }

}
