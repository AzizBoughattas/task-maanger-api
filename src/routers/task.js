const express = require('express')
const router = express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')

router.post('/tasks' ,auth, async (req,res) => {
   // const task = new Task(req.body)

   const task = new Task({
    ...req.body,
    owner : req.user._id
   })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }

})
//Get /tasks?completed=
//GET /tasks?limit=10&skip=
//GET /tasks?sortBy=createdAt_asc
router.get('/tasks', auth, async(req,res)=> {
    const match = {}
    const sort = {}

    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy) {
        const parts =req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 :1
    }

    try {
       // const tasks = await Task.find({owner : req.user._id}) or
        await req.user.populate({
            path: 'tasks',
            match : match,
            options : {
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send()
    }

})

router.get('/tasks/:id',auth,async (req,res)=> {
    const id = req.params.id

    try {
       // const task = await Task.findById(id)
       const task = await Task.findOne({_id : id , owner : req.user._id})
        if(!task) {
            res.status(404).send()
        }
        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id' ,auth, async (req,res) => {
    const allowedUpdates = ['description','completed']
    const updates = Object.keys(req.body)
    const VerifOperation = updates.every((data) => {
        return allowedUpdates.includes(data)
    })

    if(!VerifOperation) {
        return res.status(400).send({ error : 'failed to update'})
    }
    try {
        const task = await Task.findOne({_id : req.params.id, owner:req.user._id})
        
       // const task = await Task.findByIdAndUpdate(req.params.id,req.body , {new : true , runValidators:true})
        if(!task) {
           return res.status(404).send()
        }
        updates.forEach((data)=> {
            task[data] = req.body[data]
        })
        await task.save()
        res.send(task)
    } catch (error) {
      return  res.status(500).send(error)
    }
   


})

router.delete('/tasks/:id', auth , async (req,res) => {
   
    try {
        const task = await Task.findOneAndDelete({_id:req.params.id , owner : req.user._id})
        if(!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (error) {
        return res.status(500).send(error)
    }


})

module.exports = router