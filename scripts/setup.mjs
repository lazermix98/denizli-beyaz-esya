import { runSetup } from "./setup-core.mjs";

runSetup()
  .then((result) => {
    console.log("Setup tamamlandı.");
    console.log(`Firma: ${result.company.name}`);
    console.log(`Firma slug: ${result.company.slug}`);
    console.log(`Admin e-posta: ${result.admin.email}`);
    if (result.generatedPassword) {
      console.log(`Geçici admin şifresi: ${result.adminPassword}`);
      console.log("Bu şifreyi şimdi güvenli bir yere kaydedin. Tekrar gösterilmez.");
    } else {
      console.log("Admin şifresi ADMIN_PASSWORD environment değerinden alındı.");
    }
  })
  .catch((error) => {
    console.error(`Setup başarısız: ${error.message}`);
    process.exit(1);
  });
