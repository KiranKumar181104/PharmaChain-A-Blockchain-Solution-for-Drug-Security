import React, { useState } from 'react';
import Button from './common/Button';
import { STANDARD_DRUGS, COMMON_INGREDIENTS } from '../utils/constants';
import { dateToTimestamp, validateComposition } from '../utils/helpers';
import './DrugRegistration.css';

const DrugRegistration = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    batchId: '',
    drugName: '',
    manufactureDate: '',
    expiryDate: '',
    ingredients: [{ name: '', quantity: '', percentage: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', quantity: '', percentage: '' }]
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const composition = { ingredients: formData.ingredients };
      const validation = validateComposition(composition);
      
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const drugData = {
        batchId: formData.batchId,
        drugName: formData.drugName,
        composition: composition,
        manufactureDate: dateToTimestamp(formData.manufactureDate),
        expiryDate: dateToTimestamp(formData.expiryDate)
      };

      await onRegister(drugData);
      setSuccess('Drug registered successfully! Check MetaMask to confirm the transaction.');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          batchId: '',
          drugName: '',
          manufactureDate: '',
          expiryDate: '',
          ingredients: [{ name: '', quantity: '', percentage: '' }]
        });
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to register drug');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drug-registration">
      <h3>Register New Drug Batch</h3>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Batch ID *</label>
          <input
            type="text"
            value={formData.batchId}
            onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
            required
            placeholder="e.g., BATCH001"
            disabled={loading}
          />
          <small>Unique identifier for this drug batch</small>
        </div>

        <div className="form-group">
          <label>Drug Name *</label>
          <input
            type="text"
            list="drug-names"
            value={formData.drugName}
            onChange={(e) => setFormData({ ...formData, drugName: e.target.value })}
            required
            placeholder="Select or type drug name"
            disabled={loading}
          />
          <datalist id="drug-names">
            {STANDARD_DRUGS.map(drug => (
              <option key={drug} value={drug} />
            ))}
          </datalist>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Manufacture Date *</label>
            <input
              type="date"
              value={formData.manufactureDate}
              onChange={(e) => setFormData({ ...formData, manufactureDate: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Expiry Date *</label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="ingredients-section">
          <h4>Drug Composition</h4>
          <p className="section-description">Add all active and inactive ingredients</p>
          
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-row">
              <input
                type="text"
                list="ingredient-names"
                placeholder="Ingredient name"
                value={ingredient.name}
                onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                required
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Quantity (e.g., 500mg)"
                value={ingredient.quantity}
                onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                required
                disabled={loading}
              />
              <input
                type="number"
                step="0.1"
                placeholder="% (optional)"
                value={ingredient.percentage}
                onChange={(e) => updateIngredient(index, 'percentage', e.target.value)}
                disabled={loading}
              />
              {formData.ingredients.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeIngredient(index)}
                  disabled={loading}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <datalist id="ingredient-names">
            {COMMON_INGREDIENTS.map(ing => (
              <option key={ing} value={ing} />
            ))}
          </datalist>

          <Button 
            type="button" 
            variant="secondary" 
            onClick={addIngredient}
            size="small"
            disabled={loading}
          >
            + Add Ingredient
          </Button>
        </div>

        <div className="form-actions">
          <Button type="submit" loading={loading} size="large">
            {loading ? 'Registering...' : 'Register Drug'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DrugRegistration;
