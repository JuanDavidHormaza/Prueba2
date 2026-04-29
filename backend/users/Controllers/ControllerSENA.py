from django.shortcuts import render, get_object_or_404, redirect
from ..Models.modelsSENA import Person, User, Subject, DigitalDictionary


# PERSONAS
def person_list(request):
    persons = Person.objects.all()
    return render(request, 'persons/list.html', {'persons': persons})


def person_create(request):
    if request.method == 'POST':
        Person.objects.create(
            email=request.POST['email'],
            password=request.POST['password'],
            doc_type=request.POST['doc_type'],
            doc_num=request.POST['doc_num'],
            first_name=request.POST['first_name'],
            last_name=request.POST['last_name'],
            status=request.POST['status']
        )
        return redirect('person_list')
    return render(request, 'persons/create.html')


# USERS
def user_list(request):
    users = User.objects.select_related('person').all()
    return render(request, 'users/list.html', {'users': users})


# SUBJECTS
def subject_list(request):
    subjects = Subject.objects.all()
    return render(request, 'subjects/list.html', {'subjects': subjects})


# DICCIONARIO
def dictionary_list(request):
    words = DigitalDictionary.objects.select_related('subject').all()
    return render(request, 'dictionary/list.html', {'words': words})


def dictionary_create(request):
    subjects = Subject.objects.all()

    if request.method == 'POST':
        DigitalDictionary.objects.create(
            word_id=request.POST['word_id'],
            subject_id=request.POST['subject'],
            definition=request.POST['definition'],
            synonyms=request.POST['synonyms'],
            audio=request.POST['audio'],
            video=request.POST.get('video'),
            image=request.POST['image']
        )
        return redirect('dictionary_list')

    return render(request, 'dictionary/create.html', {'subjects': subjects})