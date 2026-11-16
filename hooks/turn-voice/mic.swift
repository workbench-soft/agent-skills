// Exits 0 while a process records from a microphone, and 1 while none does.
// turn-voice builds it once with swiftc, so a call gets only the cue.
import CoreAudio
import Foundation

let system = AudioObjectID(kAudioObjectSystemObject)

func address(_ selector: AudioObjectPropertySelector) -> AudioObjectPropertyAddress {
  AudioObjectPropertyAddress(
    mSelector: selector, mScope: kAudioObjectPropertyScopeGlobal, mElement: 0)
}

func read<T>(_ object: AudioObjectID, _ selector: AudioObjectPropertySelector, _ value: inout T)
  -> Bool
{
  var at = address(selector)
  var size = UInt32(MemoryLayout<T>.size)
  return AudioObjectGetPropertyData(object, &at, 0, nil, &size, &value) == noErr
}

// macOS 14.2 lists the processes that use audio and tells which of them record.
if #available(macOS 14.2, *) {
  var at = address(kAudioHardwarePropertyProcessObjectList)
  var size: UInt32 = 0
  if AudioObjectGetPropertyDataSize(system, &at, 0, nil, &size) == noErr {
    var list = [AudioObjectID](repeating: 0, count: Int(size) / MemoryLayout<AudioObjectID>.size)
    if AudioObjectGetPropertyData(system, &at, 0, nil, &size, &list) == noErr {
      for process in list {
        var running: UInt32 = 0
        if read(process, kAudioProcessPropertyIsRunningInput, &running), running != 0 { exit(0) }
      }
      exit(1)
    }
  }
}

// An older macOS tells only whether the default input device runs.
var device = AudioDeviceID(0)
var running: UInt32 = 0
if read(system, kAudioHardwarePropertyDefaultInputDevice, &device),
  read(device, kAudioDevicePropertyDeviceIsRunningSomewhere, &running), running != 0
{
  exit(0)
}
exit(1)
