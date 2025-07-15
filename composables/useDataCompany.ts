// composables/useDataCompany.ts
export const useDataCompany = () => {
    const config = useRuntimeConfig();
    const company = ref(null);
    const pending = ref(false);
    const error = ref<unknown | null>(null);
  
    const fetchCompany = async (id: string) => {
      try {
        pending.value = true;
        error.value = null;
        company.value = await $fetch<{ company: any }>(`${config.public.apiBase}/api/company/${id}`, {
          credentials: 'include',
        }).then(res => res.company);
      } catch (err) {
        error.value = err;
      } finally {
        pending.value = false;
      }
    };
  
    const updateCompany = async (id: string, data: any) => {
      try {
        pending.value = true;
        await $fetch(`${config.public.apiBase}/api/company/${id}`, {
          method: 'PUT',
          body: data,
          credentials: 'include',
        });
        company.value = { ...(company.value || {}), ...data };
        return { success: true };
      } catch (err) {
        error.value = err;
        return { success: false };
      } finally {
        pending.value = false;
      }
    };

    const getCompanies = () =>
      useFetch(() => `${config.public.apiBase}/api/company`, {
        credentials: 'include'
      })
  
    return { company, pending, error, fetchCompany, updateCompany, getCompanies };
  };
  