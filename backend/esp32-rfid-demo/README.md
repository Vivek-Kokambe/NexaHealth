# ESP32 + RC522 USB RFID reader

This setup uses an ESP32 DevKit V1, an RC522 reader, and an active-high buzzer. The ESP32 sends card UIDs over USB serial to the NexaHealth patient dashboard; the dashboard sends the UID to the authenticated backend. The ESP32 does not need Wi-Fi or a device API key for this USB workflow.

## Wiring

Power the RC522 from **3.3 V only**. Do not connect its VCC to 5 V.

| RC522 pin | ESP32 DevKit V1 pin |
| --- | --- |
| SDA / SS | GPIO 5 |
| SCK | GPIO 18 |
| MOSI | GPIO 23 |
| MISO | GPIO 19 |
| IRQ | Not connected |
| GND | GND |
| RST | GPIO 22 |
| 3.3V | 3V3 |

Connect an active buzzer through an NPN transistor so the ESP32 GPIO does not have to drive the buzzer current:

- GPIO 25 → 1 kΩ resistor → NPN base (for example, 2N2222).
- NPN emitter → GND.
- NPN collector → buzzer negative.
- Buzzer positive → its rated supply (3.3 V or 5 V, according to the buzzer).
- ESP32 GND, RC522 GND, and the buzzer supply ground must be connected together.

The firmware drives GPIO 25 HIGH for a short beep after reading a new card. If using a ready-made buzzer module, check its voltage and input polarity before connecting it.

## Upload the firmware

1. Install Arduino IDE, the ESP32 board support package, and the **MFRC522** library (Miguel Balboa).
2. Open `esp32-rfid-usb-demo.ino`.
3. Select **ESP32 Dev Module** (or the matching ESP32 board) and the COM port.
4. Upload the sketch. Close Arduino Serial Monitor after upload; only one app can usually own the serial port at a time.

At 115200 baud the firmware sends `RFID_READY` at startup, then one `RFID_UID:<hex-uid>` line for each newly presented card. An `RFID_ERROR:` startup line indicates the RC522 was not detected; recheck 3.3 V, ground, and SPI wiring.

## Pair and test in NexaHealth

1. Start the backend from `backend/` and the frontend from `frontend/`.
2. Sign in to the patient account that should own the card and open the patient dashboard in Chrome or Edge at `http://localhost:5173`.
3. Click **Connect USB Reader**, then choose the ESP32 COM port in the browser prompt.
4. Click **Attach Physical Card** to start the 90-second pairing window.
5. Present the card to the RC522. The buzzer beeps on a read; the dashboard reports when the card UID is attached to that signed-in patient.
6. Present the same card again to confirm that the backend recognizes it for that patient.

The browser's Web Serial API requires a supported browser and a secure context; `localhost` is allowed for local development. On other machines or deployed sites, use HTTPS. Do not leave Arduino Serial Monitor open while the dashboard is connected.

## Security note

The RC522 reads the card UID, not a cryptographic identity. Many common RFID cards can be cloned, so a UID must not be treated as proof of identity or used by itself to authorize access to medical records. This demo only associates the UID with the currently signed-in patient account.
