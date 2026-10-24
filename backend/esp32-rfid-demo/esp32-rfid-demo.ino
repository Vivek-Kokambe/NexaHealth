#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* DEVICE_API_KEY = "SET_THE_SAME_RFID_DEVICE_KEY_AS_SERVER_ENV";
const char* SCAN_ENDPOINT = "http://192.168.1.10:5001/api/rfid/scan";

constexpr uint8_t RFID_SS_PIN = 5;
constexpr uint8_t RFID_RST_PIN = 22;
constexpr unsigned long CARD_REMOVAL_DELAY_MS = 1200;

MFRC522 reader(RFID_SS_PIN, RFID_RST_PIN);
String lastUid;
unsigned long lastCardSeenAt = 0;

String getCardUid() {
  String uid;
  for (byte index = 0; index < reader.uid.size; index++) {
    if (reader.uid.uidByte[index] < 0x10) uid += "0";
    uid += String(reader.uid.uidByte[index], HEX);
  }
  uid.toUpperCase();
  return uid;
}

void postCardUid(const String& uid) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi is not connected; scan was not sent.");
    return;
  }

  HTTPClient http;
  http.setTimeout(3000);
  http.begin(SCAN_ENDPOINT);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", DEVICE_API_KEY);

  const String body = "{\"uid\":\"" + uid + "\"}";
  const int responseCode = http.POST(body);
  Serial.printf("RFID scan response: %d %s\n", responseCode, http.getString().c_str());
  http.end();
}

void setup() {
  Serial.begin(115200);
  SPI.begin(18, 19, 23, RFID_SS_PIN);
  reader.PCD_Init();

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
  Serial.println("RFID reader ready. Present a card.");
}

void loop() {
  if (reader.PICC_IsNewCardPresent() && reader.PICC_ReadCardSerial()) {
    const String uid = getCardUid();
    lastCardSeenAt = millis();

    if (uid != lastUid) {
      lastUid = uid;
      Serial.print("Card UID: ");
      Serial.println(uid);
      postCardUid(uid);
    }

    reader.PICC_HaltA();
    reader.PCD_StopCrypto1();
  } else if (lastUid.length() > 0 && millis() - lastCardSeenAt > CARD_REMOVAL_DELAY_MS) {
    lastUid = "";
  }

  delay(50);
}