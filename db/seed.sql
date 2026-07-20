-- Demo verisi sadece staging/demo ortamı içindir. Production admin hesabını scripts/create-admin.mjs ile oluşturun.

insert into customers (full_name, phone, district, neighborhood, address)
values
  ('Ayşe K.', '0532 639 78 98', 'Pamukkale', 'Kınıklı', 'Pamukkale / Denizli'),
  ('Mehmet D.', '0532 639 78 98', 'Denizli Merkez', 'Sırakapılar', 'Denizli Merkez'),
  ('Pamukkale Apart', '0532 639 78 98', 'Pamukkale', 'Akköy', 'Pamukkale / Denizli')
on conflict do nothing;

with first_customer as (
  select id from customers where full_name = 'Ayşe K.' limit 1
), first_device as (
  insert into devices (customer_id, device_type, brand, model, notes)
  select id, 'Buzdolabı', 'Arçelik', 'No Frost', 'Demo cihaz geçmişi' from first_customer
  returning id, customer_id
), first_service as (
  insert into service_records (customer_id, device_id, service_type, problem_summary, status, technician_notes, operation_summary, warranty_until)
  select customer_id, id, 'Buzdolabı tamiri', 'Soğutmuyor', 'completed', 'Kompresör ölçümü yapıldı.', 'Kapı fitili değişti ve performans testi yapıldı.', current_date + interval '6 months'
  from first_device
  returning id
)
insert into used_parts (service_record_id, part_name, quantity, unit_price, warranty_months)
select id, 'Kapı fitili', 1, 850, 6 from first_service;

insert into ai_content_items (content_type, topic, output, channel)
values (
  'Google İşletme gönderisi',
  'Denizli klima bakımı',
  'Denizli ve Pamukkale için klima bakım randevusu almak üzere 0532 639 78 98 numarasını arayabilirsiniz.',
  'Google İşletme'
);
