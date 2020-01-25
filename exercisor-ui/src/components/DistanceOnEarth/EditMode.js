import React from 'react';
import AnyModeBase from './AnyModeBase';

export default class DoEEditMode extends AnyModeBase {
  getFeatures() {
    return { features: [], exhausted: true };
  }
}
