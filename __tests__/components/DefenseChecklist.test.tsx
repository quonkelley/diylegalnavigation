import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DefenseChecklist, { SAMPLE_DEFENSES } from '../../components/DefenseChecklist'

const mockOnSelectionChange = jest.fn()

describe('DefenseChecklist Component', () => {
  beforeEach(() => {
    mockOnSelectionChange.mockClear()
  })

  it('renders with default title and subtitle', () => {
    render(
      <DefenseChecklist 
        defenses={SAMPLE_DEFENSES} 
        onSelectionChange={mockOnSelectionChange} 
      />
    )
    
    expect(screen.getByText('Select Your Legal Defenses')).toBeInTheDocument()
    expect(screen.getByText('Choose all defenses that apply to your situation')).toBeInTheDocument()
  })

  it('renders with custom title and subtitle', () => {
    render(
      <DefenseChecklist 
        defenses={SAMPLE_DEFENSES} 
        onSelectionChange={mockOnSelectionChange}
        title="Custom Defense Title"
        subtitle="Custom subtitle text"
      />
    )
    
    expect(screen.getByText('Custom Defense Title')).toBeInTheDocument()
    expect(screen.getByText('Custom subtitle text')).toBeInTheDocument()
  })

  it('displays all defense categories', () => {
    render(
      <DefenseChecklist 
        defenses={SAMPLE_DEFENSES} 
        onSelectionChange={mockOnSelectionChange} 
      />
    )
    
    expect(screen.getByText('Procedural Defenses')).toBeInTheDocument()
    expect(screen.getByText('Financial Defenses')).toBeInTheDocument()
    expect(screen.getByText('Substantive Defenses')).toBeInTheDocument()
  })

  it('displays all sample defenses', () => {
    render(
      <DefenseChecklist 
        defenses={SAMPLE_DEFENSES} 
        onSelectionChange={mockOnSelectionChange} 
      />
    )
    
    expect(screen.getByText('Improper Notice')).toBeInTheDocument()
    expect(screen.getByText('Rent Was Paid')).toBeInTheDocument()
    expect(screen.getByText('Warranty of Habitability')).toBeInTheDocument()
    expect(screen.getByText('Retaliatory Eviction')).toBeInTheDocument()
    expect(screen.getByText('Discrimination')).toBeInTheDocument()
  })

  it('allows multiple selections by default', async () => {
    const user = userEvent.setup()
    
    render(
      <DefenseChecklist 
        defenses={SAMPLE_DEFENSES} 
        onSelectionChange={mockOnSelectionChange} 
      />
    )
    
    const improperNoticeDefense = screen.getByText('Improper Notice').closest('[role="checkbox"]')
    const rentPaidDefense = screen.getByText('Rent Was Paid').closest('[role="checkbox"]')
    
    await user.click(improperNoticeDefense!)
    await user.click(rentPaidDefense!)
    
    expect(mockOnSelectionChange).toHaveBeenCalledTimes(2)
    expect(screen.getByText('2 defenses selected:')).toBeInTheDocument()
    // Verify both defenses are shown as selected via their aria attributes
    expect(improperNoticeDefense).toHaveAttribute('aria-checked', 'true')
    expect(rentPaidDefense).toHaveAttribute('aria-checked', 'true')
  })

  it('restricts to single selection when allowMultiple is false', async () => {
    const user = userEvent.setup()
    
    render(
      <DefenseChecklist 
        defenses={SAMPLE_DEFENSES} 
        onSelectionChange={mockOnSelectionChange}
        allowMultiple={false}
      />
    )
    
    expect(screen.getByText('Select only one defense that best applies')).toBeInTheDocument()
    
    const improperNoticeDefense = screen.getByText('Improper Notice').closest('[role="checkbox"]')
    const rentPaidDefense = screen.getByText('Rent Was Paid').closest('[role="checkbox"]')
    
    await user.click(improperNoticeDefense!)
    await user.click(rentPaidDefense!)
    
    // Should only have one selected (the last one clicked)
    expect(screen.getByText('1 defense selected:')).toBeInTheDocument()
    // Verify only the last clicked defense is selected
    expect(improperNoticeDefense).toHaveAttribute('aria-checked', 'false')
    expect(rentPaidDefense).toHaveAttribute('aria-checked', 'true')
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    
    render(
      <DefenseChecklist 
        defenses={SAMPLE_DEFENSES} 
        onSelectionChange={mockOnSelectionChange} 
      />
    )
    
    const firstDefense = screen.getByText('Improper Notice').closest('[role="checkbox"]')
    expect(firstDefense).toBeInTheDocument()
    
    if (firstDefense) {
      firstDefense.focus()
      await user.keyboard('{Enter}')
      expect(mockOnSelectionChange).toHaveBeenCalled()
    }
  })

  it('supports spacebar for selection', async () => {
    const user = userEvent.setup()
    
    render(
      <DefenseChecklist 
        defenses={SAMPLE_DEFENSES} 
        onSelectionChange={mockOnSelectionChange} 
      />
    )
    
    const firstDefense = screen.getByText('Improper Notice').closest('[role="checkbox"]')
    expect(firstDefense).toBeInTheDocument()
    
    if (firstDefense) {
      firstDefense.focus()
      await user.keyboard('{ }')
      expect(mockOnSelectionChange).toHaveBeenCalled()
    }
  })

  it('can deselect items in multiple selection mode', async () => {
    const user = userEvent.setup()
    
    render(
      <DefenseChecklist 
        defenses={SAMPLE_DEFENSES} 
        onSelectionChange={mockOnSelectionChange} 
      />
    )
    
    // Select an item by clicking the checkbox element
    const firstDefense = screen.getByText('Improper Notice').closest('[role="checkbox"]')
    await user.click(firstDefense!)
    expect(screen.getByText('1 defense selected:')).toBeInTheDocument()
    
    // Deselect the same item
    await user.click(firstDefense!)
    expect(screen.queryByText('1 defense selected:')).not.toBeInTheDocument()
  })

  it('can deselect items in single selection mode', async () => {
    const user = userEvent.setup()
    
    render(
      <DefenseChecklist 
        defenses={SAMPLE_DEFENSES} 
        onSelectionChange={mockOnSelectionChange}
        allowMultiple={false}
      />
    )
    
    // Select an item by clicking the checkbox element
    const firstDefense = screen.getByText('Improper Notice').closest('[role="checkbox"]')
    await user.click(firstDefense!)
    expect(screen.getByText('1 defense selected:')).toBeInTheDocument()
    
    // Deselect the same item
    await user.click(firstDefense!)
    expect(screen.queryByText('1 defense selected:')).not.toBeInTheDocument()
  })

  it('calls onSelectionChange with correct data structure', async () => {
    const user = userEvent.setup()
    
    render(
      <DefenseChecklist 
        defenses={SAMPLE_DEFENSES} 
        onSelectionChange={mockOnSelectionChange} 
      />
    )
    
    const improperNoticeDefense = screen.getByText('Improper Notice').closest('[role="checkbox"]')
    await user.click(improperNoticeDefense!)
    
    expect(mockOnSelectionChange).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'improper_notice',
        title: 'Improper Notice',
        description: 'The landlord did not provide proper notice as required by law',
        category: 'procedural',
        selected: true
      })
    ])
  })

  it('handles defenses with pre-selected items', () => {
    const defensesWithSelection = SAMPLE_DEFENSES.map((defense, index) => 
      index === 0 ? { ...defense, selected: true } : defense
    )
    
    render(
      <DefenseChecklist 
        defenses={defensesWithSelection} 
        onSelectionChange={mockOnSelectionChange} 
      />
    )
    
    expect(screen.getByText('1 defense selected:')).toBeInTheDocument()
    // Check that the pre-selected defense is shown as selected
    const allCheckboxes = screen.getAllByRole('checkbox')
    const preSelectedDefense = allCheckboxes.find(checkbox => 
      checkbox.getAttribute('aria-checked') === 'true'
    )
    expect(preSelectedDefense).toBeInTheDocument()
  })

  it('handles empty defense list', () => {
    render(
      <DefenseChecklist 
        defenses={[]} 
        onSelectionChange={mockOnSelectionChange} 
      />
    )
    
    expect(screen.getByText('Select Your Legal Defenses')).toBeInTheDocument()
    expect(screen.queryByText('Procedural Defenses')).not.toBeInTheDocument()
  })

  it('handles defenses without categories', () => {
    const defensesWithoutCategory = [
      {
        id: 'test_defense',
        title: 'Test Defense',
        description: 'A test defense without category',
        selected: false
      }
    ]
    
    render(
      <DefenseChecklist 
        defenses={defensesWithoutCategory} 
        onSelectionChange={mockOnSelectionChange} 
      />
    )
    
    expect(screen.getByText('Other Defenses')).toBeInTheDocument()
    expect(screen.getByText('Test Defense')).toBeInTheDocument()
  })

  it('shows proper accessibility attributes', () => {
    render(
      <DefenseChecklist 
        defenses={SAMPLE_DEFENSES} 
        onSelectionChange={mockOnSelectionChange} 
      />
    )
    
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBe(SAMPLE_DEFENSES.length)
    
    checkboxes.forEach(checkbox => {
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
      expect(checkbox).toHaveAttribute('tabIndex', '0')
    })
  })

  it('updates aria-checked when item is selected', async () => {
    const user = userEvent.setup()
    
    render(
      <DefenseChecklist 
        defenses={SAMPLE_DEFENSES} 
        onSelectionChange={mockOnSelectionChange} 
      />
    )
    
    const firstCheckbox = screen.getByText('Improper Notice').closest('[role="checkbox"]')
    expect(firstCheckbox).toHaveAttribute('aria-checked', 'false')
    
    await user.click(firstCheckbox!)
    expect(firstCheckbox).toHaveAttribute('aria-checked', 'true')
  })
}) 