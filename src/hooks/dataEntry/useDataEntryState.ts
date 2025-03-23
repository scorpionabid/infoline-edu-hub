const handleValidationError = (errors: ColumnValidationError[]) => {
  setFormErrors(errors);
  
  setToastState({
    open: true,
    type: "error",
    message: t("validationErrors"),
    description: `${errors.length} ${t("errorsFound")}`
  });
  
  toast.error(t("validationErrors"));
};
