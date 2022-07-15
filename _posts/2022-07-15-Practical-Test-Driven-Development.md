# Practical Test Driven Development


Most programmers would say that writing tests is a waste of time, that it is taking precious hours that could have been spent on the *actual* problem solving, that *"they're just tests."*

Ever since I was introduced to TDD very early on in my career, I was fascinated by them. I thought that it would safeguard my software from my own brain. This thinking has stuck with me, 8 years later into my career as a software engineer. It has saved me countless times, and will still save me and my teams for the years to come in the future.

I sound like a crazed TDD fanatic, do I? I just really love the concept of writing tests. I am not a very strict follower of the TDD movement myself, I write the logic first and the tests next most of the time too. I applied writing tests into my workflow only late into my career, as the teams I joined in my years as a junior developer did not write tests. I want to perfect the skill, so I try to join teams that have the resources and the will for their members to write tests and clean code.

So why write tests? Why do I go on about convincing you to write tests for your software?

Here is my current workflow when given a task as a programmer:
1. Identify the problem
2. Write the tests
3. Write the function/logic (2 and 3 are interchangeable)
4. Run the tests, following the Red-Green-Refactor methodology of testing
5. Done

The step `Write the tests` complements the step `Identify the problem`. How? In writing the tests, you are taught to write the test functions like this:

```python
def test_calling_command_creates_config_successfully(self):
        ...

def test_calling_command_with_incorrect_args_fails(self):
        ...
```

Notice that the function names are descriptive. They define what something must do. Being able to write the intention of a test and visualize what you are trying to solve helps immensely in solving a problem. In a way, you are reading back to your self what you intend to do with your task by writing it down in the tests.

Writing tests this way has a good little side effect: It explains to the next programmer what your function does and is supposed to do.

*But what if I or another programmer wants to change/remove the tests I wrote in the past?*

This is the greatest benefit that TDD can give, in my opinion. When the time comes that your software needs to be updated and the logic changed, the tests will be the guardians to keep everything in check.

Let's say for example, the business logic now requires my command to be able to run even if the `args` are incorrect. The test that used to handle this is `test_calling_command_with_incorrect_args_fails` (Refer to above example).My old test’s intention is to not let the invalid arguments from going through my function, and that went well in the past. But now that the business logic is changed, the new implementation will trigger a conversation asking why the business logic makes sense and the code/logic must change.
This will allow the programmer to ask questions if the new changes should really be made, or if there are any repercussions to changing the logic, or is it required to create more tests to give more coverage in preparation for the new logic change.

One more benefit of writing tests is that the developers can just look at how the tests are set up and immediately understand what a function needs to run.

Most of my tests look like this these days:

```python
def test_get_config_succeeds(self):
    url = reverse('my-endpoint-url')

    person = PersonFactory(
        name=fake.name(),
        address=fake.address(),
    )
    config = ConfigFactory(
        max_person_count=randint(1, 20),
        active_only=False,
    )

    response = self.client.get(url)
    self.assertEqual(response.status_code, 200)
    self.assertIsNotNone(response.json()['id'])
```

At first glance, it’s just another unit test. Nothing surprising, but if you think about it, the test shows what the requirements are for my test to pass. It needs a `person` and a `config` object for the response of the endpoint to be a `200`. So if I wanted to create more tests for edge cases, I can refer to this original test to see what I need to achieve the same or inverse result.

Test setups can easily indicate what is needed for a logic/function to work.

In conclusion: tests are like code comments, but more fleshed out *and the CI has to check them LOL*.
Tests may consume a lot of time when writing, but they save your team from technical debt and acts as a form of documentation for your code. It saves your time by reducing the need for asking questions that are supposed to be already answered to other team members repeatedly over the course of a project over and over.
