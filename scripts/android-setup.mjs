// After `tauri android init`: adds the permissions the app needs and, when a keystore is
// present (src-tauri/gen/android/keystore.properties), signs release builds with it.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const root = new URL("../src-tauri/gen/android/", import.meta.url);
const man = new URL("app/src/main/AndroidManifest.xml", root);
let m = readFileSync(man, "utf8");
const perms = ["android.permission.RECORD_AUDIO", "android.permission.MODIFY_AUDIO_SETTINGS", "android.permission.POST_NOTIFICATIONS", "android.permission.INTERNET"];
for (const p of perms) {
  if (!m.includes(`"${p}"`)) m = m.replace("<application", `<uses-permission android:name="${p}" />\n    <application`);
}
writeFileSync(man, m);

const gradle = new URL("app/build.gradle.kts", root);
let g = readFileSync(gradle, "utf8");
if (existsSync(new URL("keystore.properties", root)) && !g.includes('signingConfigs.getByName("release")')) {
  if (!g.includes("import java.io.FileInputStream")) g = "import java.io.FileInputStream\n" + g;
  if (!g.includes("import java.util.Properties")) g = "import java.util.Properties\n" + g;
  g = g.replace(/(\n\s*buildTypes\s*\{)/, `
    signingConfigs {
        create("release") {
            val kp = Properties()
            kp.load(FileInputStream(rootProject.file("keystore.properties")))
            keyAlias = kp["keyAlias"] as String
            keyPassword = kp["password"] as String
            storeFile = rootProject.file(kp["storeFile"] as String)
            storePassword = kp["password"] as String
        }
    }$1`);
  g = g.replace(/getByName\("release"\)\s*\{/, 'getByName("release") {\n            signingConfig = signingConfigs.getByName("release")');
  console.log("release builds will be signed");
} else {
  console.log("no keystore: the release build will be unsigned");
}
writeFileSync(gradle, g);
console.log("Android project ready");
