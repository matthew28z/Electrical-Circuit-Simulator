import { test } from 'vitest';

import { simpleCircuit } from "./commonTests.js";

test(`This test creates a very simple circuit and passes values to the created elements.
      Then it checks if the data was handled correctly and if so, it also checks if the data was
      processed in the expected way.`, await simpleCircuit)