//=============================================================================
// Test:   instr_timing
// Source: http://blargg.8bitalley.com/parodius/nes-tests/instr_timing.zip
//=============================================================================

import { FakeUnit } from "../../debug/fake-unit"

export const name = "instr_timing";
export const rom = "./emulator/core/tests/instr_timing/instr_timing.nes"

export function configure(config) {
    config["ppu"] = FakeUnit;
}

export function execute(test) {
    test.blargg();
}