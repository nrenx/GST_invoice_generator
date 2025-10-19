import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { InvoiceForm } from "../src/components/InvoiceForm";

render(
  <MemoryRouter>
    <InvoiceForm />
  </MemoryRouter>
);

console.log("rendered");
