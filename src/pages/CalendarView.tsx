
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTaskId || !hours) {
      toast({
        title: 'Erro',
        description: 'Por favor, completa todos os campos requiridos',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    // Parse hours (hh:mm) to number
    const [hoursVal, minutesVal] = hours.split(':').map(Number);
    const hoursNumber = hoursVal + (minutesVal / 60);
    
    // Create new time entry
    const newEntry: TimeEntry = {
      id: `te_${Date.now()}`,
      taskId: selectedTaskId,
      userId: currentUser?.id || '',
      hours: hoursNumber,
      date: format(selectedDate, 'yyyy-MM-dd'),
      notes: notes || undefined,
      category: category || undefined,
      project: project || undefined,
      activity: activity || undefined,
      timeFormat: hours
    };
    
    // Add to db - updated function name
    addTimeEntryOld(newEntry);
    
    // Update state
    setTimeEntries([...timeEntries, newEntry]);
    
    toast({
      title: 'Horas rexistradas',
      description: 'Rexistráronse as túas horas correctamente.',
    });
    
    // Close dialog and reset form
    setIsDialogOpen(false);
    setSubmitting(false);
  };
