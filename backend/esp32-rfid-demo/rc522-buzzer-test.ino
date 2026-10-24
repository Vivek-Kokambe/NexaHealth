#include <SPI.h>
#include <MFRC522.h>

constexpr uint8_t RFID_SS_PIN = 5;
constexpr uint8_t RFID_RST_PIN = 22;
constexpr uint8_t BUZZER_PIN = 25;
constexpr unsigned long BEEP_COOLDOWN_MS = 1200;

MFRC522 reader(RFID_SS_PIN, RFID_RST_PIN);
unsigned long lastBeepAt = 0;
bool hasBeeped = false;

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  SPI.begin(18, 19, 23, RFID_SS_PIN);
  reader.PCD_Init();
  delay(50);
  Serial.println("RC522 ready. Present a card.");
}

void loop() {
  if (!reader.PICC_IsNewCardPresent() || !reader.PICC_ReadCardSerial()) {
    delay(30);
    return;
  }

  Serial.print("Card UID: ");
  for (byte index = 0; index < reader.uid.size; index++) {
    if (reader.uid.uidByte[index] < 0x10) Serial.print('0');
    Serial.print(reader.uid.uidByte[index], HEX);
    if (index + 1 < reader.uid.size) Serial.print(':');
  }
  Serial.println();

  if (!hasBeeped || millis() - lastBeepAt >= BEEP_COOLDOWN_MS) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(100);
    digitalWrite(BUZZER_PIN, LOW);
    lastBeepAt = millis();
    hasBeeped = true;
  }

  reader.PICC_HaltA();
  reader.PCD_StopCrypto1();
  delay(250);
}