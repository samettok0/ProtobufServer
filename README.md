# ProtobufServer
Node.js + TypeScript + gRPC

## Kurulum

1. Bağımlılıkları yükleyin:

```bash
npm install
```

2. Proto dosyalarından TypeScript tiplerini üretin:

```bash
npm run proto-gen
```

> `proto-gen.sh` scripti, `proto/` klasöründeki .proto dosyalarından gerekli TypeScript tiplerini otomatik olarak üretir. Eğer proto dosyalarında değişiklik yaparsanız bu komutu tekrar çalıştırmalısınız.

## Sunucuyu Başlatma

```bash
npm start
```
veya
```bash
npx ts-node server.ts
```

Sunucu varsayılan olarak `8082` portunda çalışır.

## İstemciyi Başlatma

```bash
npm run client -- <kullanıcı_adı>
```
veya
```bash
npx ts-node client.ts <kullanıcı_adı>
```

> İstemciyi başlatırken bir kullanıcı adı girmeniz gerekmektedir. Örneğin:
> ```bash
> npm run client -- samet
> ```

## Sağlanan gRPC Servisleri

### Random

- **PingPong**: Basit bir ping-pong testi. Sunucuya mesaj gönderir, "PONG!" cevabı alırsınız.
- **RandomNumbers**: Belirtilen maksimum değere kadar rastgele sayılar üretir ve stream olarak gönderir.
- **TodoList**: Stream olarak todo item'ları gönderip, sunucudan toplu todo listesi alırsınız.
- **ChatApp**: Kullanıcı adı ile bağlanıp, diğer istemcilerle gerçek zamanlı sohbet edebilirsiniz. "quit" yazarak çıkabilirsiniz.

## Proto Tanımı

Tüm servis ve mesaj tanımları `proto/random.proto` dosyasındadır.

## Geliştirici Notları
- Proje TypeScript ile yazılmıştır.
- `ts-node` ile doğrudan TypeScript dosyalarını çalıştırabilirsiniz.
- Yeni proto mesajları/servisleri eklediğinizde `npm run proto-gen` komutunu tekrar çalıştırmayı unutmayın.

## Bağımlılıklar
- @grpc/grpc-js
- @grpc/proto-loader
- typescript
- ts-node

