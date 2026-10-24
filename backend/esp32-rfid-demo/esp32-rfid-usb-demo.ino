#include <SPI.h>
#include <MFRC522.h>

constexpr uint8_t RFID_SS_PIN = 5;
constexpr uint8_t RFID_RST_PIN = 22;
constexpr uint8_t BUZZER_PIN = 25;
constexpr unsigned long CARD_RELEASE_DELAY_MS = 1000;

MFRC522 reader(RFID_SS_PIN, RFID_RST_PIN);
String lastUid;
unsigned long lastCardSeenAt = 0;

String readUid() {
  String uid;
  for (byte index = 0; index < reader.uid.size; index++) {
    if (reader.uid.uidByte[index] < 0x10) uid += "0";
    uid += String(reader.uid.uidByte[index], HEX);
  }
  uid.toUpperCase();
  return uid;
}

void beepOnCardRead() {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(80);
  digitalWrite(BUZZER_PIN, LOW);
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  SPI.begin(18, 19, 23, RFID_SS_PIN);
  reader.PCD_Init();
  Serial.println("RFID_READY");
}

void loop() {
  if (reader.PICC_IsNewCardPresent() && reader.PICC_ReadCardSerial()) {
    const String uid = readUid();
    lastCardSeenAt = millis();

    if (uid != lastUid) {
      lastUid = uid;
      Serial.print("RFID_UID:");
      Serial.println(uid);
      beepOnCardRead();
    }

    reader.PICC_HaltA();
    reader.PCD_StopCrypto1();
  } else if (lastUid.length() > 0 && millis() - lastCardSeenAt > CARD_RELEASE_DELAY_MS) {
    lastUid = "";
  }

  delay(30);
}