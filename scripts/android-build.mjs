import { existsSync, mkdirSync, readdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const env={...process.env};
const cloud='/workspace/toolchains';
// Reuse the cloud toolchain when present. Normal local builds use Android Studio's
// SDK and the developer's JAVA_HOME, ANDROID_HOME, and Gradle configuration.
if(existsSync(join(cloud,'android-sdk'))){
  env.ANDROID_HOME ||= join(cloud,'android-sdk');
  env.JAVA_HOME ||= join(cloud,readdirSync(cloud).find(n=>n.startsWith('jdk-'))||'jdk');
  env.GRADLE_USER_HOME ||= join(cloud,'gradle');
  env.ANDROID_USER_HOME ||= join(cloud,'android-user');
  mkdirSync(join(cloud,'java-user'),{recursive:true});
  const opts=[env.JAVA_TOOL_OPTIONS||'',`-Duser.home=${join(cloud,'java-user')}`];
  if(existsSync('/etc/ssl/certs/java/cacerts'))opts.push('-Djavax.net.ssl.trustStore=/etc/ssl/certs/java/cacerts');
  const proxy=env.HTTPS_PROXY||env.https_proxy;
  if(proxy){const u=new URL(proxy);opts.push(`-Dhttps.proxyHost=${u.hostname}`,`-Dhttps.proxyPort=${u.port||80}`,`-Dhttp.proxyHost=${u.hostname}`,`-Dhttp.proxyPort=${u.port||80}`,'-Dhttp.nonProxyHosts=localhost|127.*');}
  env.JAVA_TOOL_OPTIONS=opts.filter(Boolean).join(' ');
}
if(env.ANDROID_HOME)writeFileSync(join(root,'android','local.properties'),`sdk.dir=${env.ANDROID_HOME.replaceAll('\\','/')}\n`);
const tasks=process.argv.slice(2);
const result=spawnSync(process.platform==='win32'?'gradlew.bat':'./gradlew',[...(tasks.length?tasks:['assembleDebug']),'--no-daemon','--max-workers=2','--console=plain'],{cwd:join(root,'android'),env,stdio:'inherit',shell:process.platform==='win32'});
if(result.error)throw result.error;
if(result.status!==0)process.exit(result.status||1);
if(!tasks.length||tasks.includes('assembleDebug')){
  mkdirSync(join(root,'artifacts'),{recursive:true});
  copyFileSync(join(root,'android/app/build/outputs/apk/debug/app-debug.apk'),join(root,'artifacts/hue-water-sort-debug.apk'));
  console.log('APK: artifacts/hue-water-sort-debug.apk');
}
