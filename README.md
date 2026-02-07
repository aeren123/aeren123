# Ev Bütçe Takipçisi

Bu küçük web uygulaması, ev içinde gelir/gider kayıtlarını hızlıca ekleyip toplamları anlık takip etmenizi sağlar. Veriler sadece tarayıcınızın `localStorage` alanında tutulur.

## Özellikler
- Gelir/gider kayıtları ekleme
- Toplam gelir, toplam gider ve bakiye özeti
- Filtreleme ve arama
- JSON olarak dışa aktarma
- Tüm kayıtları temizleme

## Kullanım
1. Dosyaları yerel bir web sunucusunda çalıştırın:
   ```bash
   python3 -m http.server
   ```
2. Tarayıcıda `http://localhost:8000` adresine gidin.
3. Mobilde yüklemek için tarayıcı menüsünden “Ana Ekrana Ekle” (iOS) veya “Uygulamayı Yükle” (Android/Chrome) seçeneğini kullanın.

## Notlar
- Veriler cihazınızda saklandığı için farklı cihazlarda görünmez.
- Düzenli yedek almak için “JSON İndir” butonunu kullanabilirsiniz.
