# ຕັ້ງຄ່າລະບົບ Admin (Supabase) — ໃຊ້ເວລາປະມານ 10 ນາທີ

1. ສ້າງບັນຊີ/ໂປຣເຈັກຟຣີທີ່ https://supabase.com (ເລືອກ Region ໃກ້ລາວ ເຊັ່ນ Singapore).
2. ເມນູ **SQL Editor** → New query → ວາງເນື້ອໃນໄຟລ໌ `supabase-setup.sql` ທັງໝົດ → **Run**.
3. ເມນູ **Authentication → Users → Add user** → ໃສ່ອີເມວ + ລະຫັດຜ່ານຂອງ Admin (ຕິກ Auto Confirm User).
4. ກັບໄປ SQL Editor ແລ້ວ Run ຄຳສັ່ງນີ້ (ແກ້ອີເມວໃຫ້ກົງກັບຂໍ້ 3):
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'jonepms16@gmail.com';
   ```
5. ເມນູ **Project Settings → API** → ຄັດລອກ **Project URL** ແລະ **anon public key** ໄປໃສ່ໄຟລ໌ `config.js`.
   ຫ້າມໃສ່ `service_role` key ໃນເວັບເດັດຂາດ. anon key ເປີດເຜີຍໄດ້ ເພາະສິດຖືກຄວບຄຸມໂດຍ RLS ໃນ SQL.
6. ອັບໂຫຼດໂຟນເດີທັງໝົດຂຶ້ນ hosting ແລ້ວເປີດ `/admin.html` ເພື່ອເຂົ້າສູ່ລະບົບ.

## ວິທີໃຊ້ໜ້າ Admin
- ເລືອກຮູບ (PNG/JPG/WEBP) ຫຼື PDF (ໃຊ້ໜ້າທຳອິດ) ຂອງດີໄຊນ໌ A4 ແນວຕັ້ງ ທີ່ **ບໍ່ມີຂໍ້ຄວາມ** (ມີສະເພາະສີ/ກອບ/ລາຍ).
- ເລືອກໂຄງຮ່າງ, ສີ, ຂອບເນື້ອໃນ, ຕຳແໜ່ງຮູບໂປຣໄຟລ໌ ແລ້ວເບິ່ງຕົວຢ່າງສົດທາງຂວາ → **ບັນທຶກ**.
- ແບບທີ່ເຜີຍແຜ່ຈະປາກົດໃນໜ້າເວັບຫຼັກຂອງທຸກຄົນທັນທີ (ປຸ່ມ ເຊື່ອງ/ແກ້ໄຂ/ລຶບ ຢູ່ລຸ່ມລາຍການ).
