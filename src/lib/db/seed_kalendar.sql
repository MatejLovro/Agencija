-- ============================================================
-- SEED: guests, reservations, stays
-- Agency ID: 3ab285b4-6f7c-4b26-a74a-732d121df90a
-- Accommodation IDs:
--   3167488c-d4d4-4366-939b-675690f56e1d
--   4a0cec16-792d-4e4a-a6ec-29440bcb5657
--   a97bf7ca-aae8-43b6-b5f0-60d012f079a9
--   ca026154-cb52-4702-a8a2-4870d715ee12
-- ============================================================

-- ─── GUESTS ─────────────────────────────────────────────────────────────────

INSERT INTO guests (
  id, agency_id,
  surname, name, gender, date_of_birth,
  state_birth, document_type, document_number,
  citizenship
) VALUES
(
  'a1000000-0000-0000-0000-000000000001',
  '3ab285b4-6f7c-4b26-a74a-732d121df90a',
  'Horvat', 'Ivan', 'muski', '1985-03-12',
  'HRV', 'osobna', 'HR123456789',
  'HRV'
),
(
  'a1000000-0000-0000-0000-000000000002',
  '3ab285b4-6f7c-4b26-a74a-732d121df90a',
  'Müller', 'Hans', 'muski', '1972-07-24',
  'DEU', 'putovnica', 'DE987654321',
  'DEU'
),
(
  'a1000000-0000-0000-0000-000000000003',
  '3ab285b4-6f7c-4b26-a74a-732d121df90a',
  'Kovač', 'Marija', 'zenski', '1990-11-05',
  'HRV', 'osobna', 'HR000111222',
  'HRV'
);

-- ─── RESERVATIONS ────────────────────────────────────────────────────────────
-- Rezervacija 1: potvrđena, apartman 1, Horvat Ivan
-- Pokriva: 2026-06-20 do 2026-06-28

INSERT INTO reservations (
  id, agency_id, accommodation_id, redni_broj,
  guest_name, guest_surname, email, phone,
  date_from, date_to,
  adults, teens_18, children, pet,
  price, avans_percent, avans_amount,
  rezervation_valid, status
) VALUES
(
  'b1000000-0000-0000-0000-000000000001',
  '3ab285b4-6f7c-4b26-a74a-732d121df90a',
  '3167488c-d4d4-4366-939b-675690f56e1d',
  1001,
  'Ivan', 'Horvat', 'ivan.horvat@email.hr', '+385911234567',
  '2026-06-20', '2026-06-28',
  2, 0, 0, false,
  1200.00, 30.00, 360.00,
  '2026-06-15', 'potvrdjena'
),
-- Rezervacija 2: potvrđena, apartman 2, Müller Hans
-- Pokriva: 2026-07-01 do 2026-07-10
(
  'b1000000-0000-0000-0000-000000000002',
  '3ab285b4-6f7c-4b26-a74a-732d121df90a',
  '4a0cec16-792d-4e4a-a6ec-29440bcb5657',
  1002,
  'Hans', 'Müller', 'hans.mueller@web.de', '+4917612345678',
  '2026-07-01', '2026-07-10',
  2, 1, 0, false,
  1800.00, 50.00, 900.00,
  '2026-06-20', 'potvrdjena'
),
-- Rezervacija 3: nepotvrđena, apartman 3, Kovač Marija
-- Pokriva: 2026-06-25 do 2026-06-30
(
  'b1000000-0000-0000-0000-000000000003',
  '3ab285b4-6f7c-4b26-a74a-732d121df90a',
  'a97bf7ca-aae8-43b6-b5f0-60d012f079a9',
  1003,
  'Marija', 'Kovač', NULL, '+385921112233',
  '2026-06-25', '2026-06-30',
  1, 0, 0, false,
  600.00, NULL, NULL,
  '2026-06-18', 'nepotvrdjena'
),
-- Rezervacija 4: potvrđena, apartman 4, Horvat Ivan (drugi termin)
-- Pokriva: 2026-07-05 do 2026-07-15
(
  'b1000000-0000-0000-0000-000000000004',
  '3ab285b4-6f7c-4b26-a74a-732d121df90a',
  'ca026154-cb52-4702-a8a2-4870d715ee12',
  1004,
  'Ivan', 'Horvat', 'ivan.horvat@email.hr', '+385911234567',
  '2026-07-05', '2026-07-15',
  3, 0, 1, true,
  2200.00, 30.00, 660.00,
  '2026-06-25', 'potvrdjena'
);

-- ─── STAYS ───────────────────────────────────────────────────────────────────
-- Stay 1: prijava na temelju rezervacije 1 (Horvat Ivan, apartman 1)
-- Gost je ušao, stay je aktivan

INSERT INTO stays (
  id, agency_id, accommodation_id, redni_broj,
  reservation_id, guest_id,
  date_from, date_to,
  iznos_smjestaja, fakturirana, racun_u_ime_iznajmljivaca,
  status
) VALUES
(
  'c1000000-0000-0000-0000-000000000001',
  '3ab285b4-6f7c-4b26-a74a-732d121df90a',
  '3167488c-d4d4-4366-939b-675690f56e1d',
  699,
  'b1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  '2026-06-20', '2026-06-28',
  500.00, false, false,
  'aktivna'
),
-- Stay 2: walk-in prijava BEZ rezervacije (Müller Hans, apartman 2)
-- Kratki boravak koji je već odjavan
(
  'c1000000-0000-0000-0000-000000000002',
  '3ab285b4-6f7c-4b26-a74a-732d121df90a',
  '4a0cec16-792d-4e4a-a6ec-29440bcb5657',
  700,
  NULL,
  'a1000000-0000-0000-0000-000000000002',
  '2026-06-09', '2026-06-14',
  500.00, true, false,
  'odjavljena'
),
-- Stay 3: walk-in prijava, Kovač Marija, apartman 4, aktivan
(
  'c1000000-0000-0000-0000-000000000003',
  '3ab285b4-6f7c-4b26-a74a-732d121df90a',
  'ca026154-cb52-4702-a8a2-4870d715ee12',
  701,
  NULL,
  'a1000000-0000-0000-0000-000000000003',
  '2026-06-12', '2026-06-18',
  500.00, false, false,
  'aktivna'
);
