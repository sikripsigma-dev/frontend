// composables/useDataCompany.ts
export const useDataCompany = () => {
  const config = useRuntimeConfig();
  const company = ref(null);
  const companies = ref<any[]>([]);
  const pending = ref(false);
  const error = ref<unknown | null>(null);
  const success = ref<boolean | null>(null);

  const fetchCompany = async (id: string) => {
    try {
      pending.value = true;
      error.value = null;
      const res = await $fetch<{ company: any }>(`${config.public.apiBase}/api/company/${id}`, {
        credentials: 'include',
      });
      company.value = res.company;
    } catch (err) {
      error.value = err;
    } finally {
      pending.value = false;
    }
  };

  const getCompanies = async () => {
    try {
      pending.value = true;
      error.value = null;
      const res = await $fetch<{ companies: any[] }>(`${config.public.apiBase}/api/company`, {
        credentials: 'include',
      });

      // Convert field casing
      companies.value = res.companies.map((c) => ({
        id: c.Id,
        name: c.Name,
        email: c.Email,
        phone: c.Phone,
        address: c.Address,
        description: c.Description,
        industry: c.Industry || '-',   // default or handle missing field
        status: c.Status || 'active',  // default if not provided
        logo: c.Logo || null,          // optional if using logos
      }));
    } catch (err) {
      error.value = err;
    } finally {
      pending.value = false;
    }
  };


  const createCompany = async (data: any) => {
    try {
      pending.value = true;
      error.value = null;
      await $fetch(`${config.public.apiBase}/api/company`, {
        method: 'POST',
        body: data,
        credentials: 'include',
      });
      success.value = true;
      await getCompanies(); // Refresh after create
    } catch (err) {
      error.value = err;
      success.value = false;
    } finally {
      pending.value = false;
    }
  };

  const updateCompany = async (id: string, data: any) => {
    try {
      pending.value = true;
      error.value = null;
      await $fetch(`${config.public.apiBase}/api/company/${id}`, {
        method: 'PUT',
        body: data,
        credentials: 'include',
      });
      success.value = true;
      await getCompanies(); // Refresh after update
    } catch (err) {
      error.value = err;
      success.value = false;
    } finally {
      pending.value = false;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      pending.value = true;
      error.value = null;
      await $fetch(`${config.public.apiBase}/api/company/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      success.value = true;
      await getCompanies(); // Refresh after delete
    } catch (err) {
      error.value = err;
      success.value = false;
    } finally {
      pending.value = false;
    }
  };

  return {
    company,
    companies,
    pending,
    error,
    success,
    fetchCompany,
    getCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
  };
};
